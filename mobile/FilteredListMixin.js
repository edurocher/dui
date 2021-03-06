define([
	"require",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/aspect",
	"dui/registry",
	"./SearchBox",
	"./ScrollableView",
	"./viewRegistry"
], function(require, declare, lang, dom, domClass, domConstruct,  
			aspect, registry, SearchBox, ScrollableView, viewRegistry){

	// module:
	//		dui/mobile/FilteredListMixin

	return declare("dui.mobile.FilteredListMixin", null, {
		// summary:
		//		Mixin for filtered lists.
		// description:
		//		This mixin adds filtering capabilities to all dui/mobile list widgets:
		//		dui/mobile/RoundRectList and any of its subclasses (RoundRectStoreList, 
		//		EdgeToEdgeList, EdgeToEdgeStoreList).
		//		When mixing this class into a list widget, the list items are dynamically 
		//		filtered depending on the filtering string that the user enters in a 
		//		dui/mobile/SearchBox. 
		//
		//		This mixin supports the following use-cases:
		//		1. For user's convenience, by simply mixing this class into a list widget 
		//		the mixin creates a dui/mobile/SearchBox and a dui/mobile/ScrollableView. 
		//		The list is placed inside the ScrollableView and the SearchBox, which allows
		//		filtering the list, is placed on top of the ScrollableView.
		//		2. Alternatively, the user can create (and style) the instance of dui/mobile/SearchBox, 
		//		and specify its id using the property filterBoxRef of this mixin. This allows
		//		placing the SearchBox anywhere in the DOM, while the mixin takes care of 
		//		the necessary glue to ensure the list is filtered according to the filter criteria
		//		entered in the SearchBox.
		//
		//		The filtering works for lists backed by a store (dojo/store), as well
		//		as for lists not backed by a store. When filtering a list backed by a store 
		//		containing hierarchical data (data items that are children of a parent data item), 
		//		the store must support recursive search queries such that the filtering can match 
		//		child items.
		//
		//		For configuration purposes, the instance of dui/mobile/SearchBox can be retrieved
		//		using the method getFilterBox(). If a dui/mobile/ScrollableView is created by
		//		this mixin, it can be retrieved using getScrollableView().
		//
		// example:
		// |	<!-- Markup use-case: -->
		// |	<!-- SearchBox and ScrollableView created by the mixin. -->
		// |	<!-- Filtered EdgeToEdgeStoreList created in markup. -->
		// |	<div data-dojo-type="dui/mobile/View">
		// |		<h1 data-dojo-type="dui/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<ul data-dojo-type="dui/mobile/EdgeToEdgeStoreList"
		// |			data-dojo-mixins="dui/mobile/FilteredListMixin"
		// |			data-dojo-props="placeHolder: 'Search', store: myStore"></ul>
		// |	</div>
		// example:
		// |	<!-- Markup use-case: -->
		// |	<!-- SearchBox and ScrollableView created by the mixin. -->
		// |	<!-- Filtered RoundRectList created in markup. --> 
		// |	<div data-dojo-type="dui/mobile/View">
		// |		<h1 data-dojo-type="dui/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<ul id="list" data-dojo-type="dui/mobile/RoundRectList"
		// |			data-dojo-mixins="dui/mobile/FilteredListMixin"
		// |			data-dojo-props="placeHolder: 'Search'">
		// |			<li data-dojo-type="dui/mobile/ListItem">Item 1</li>
		// |			<li data-dojo-type="dui/mobile/ListItem">Item 2</li>
		// |			...
		// |		</ul>
		// |	</div>
		// example:
		// |	// Programmatic use-case:
		// |	// SearchBox and ScrollableView created by the mixin.
		// |	// Filtered EdgeToEdgeStoreList created programmatically.
		// |	require(["dojo/_base/declare", "dojo/ready", "dui/mobile/EdgeToEdgeStoreList", 
		// |			"dui/mobile/FilteredListMixin", ...],	function(declare, ready, registry, ...){
		// |		ready(function(){
		// |			var listWidget =
		// |				new declare([EdgeToEdgeStoreList, FilteredListMixin])(
		// |					{placeHolder: 'Search', store: myStore, "filteredList"});
		// |			listWidget.startup();
		// |		});
		// |	});
		// |	...
		// |	<div id="view" data-dojo-type="dui/mobile/View">
		// |		<h1 data-dojo-type="dui/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<div id="filteredList">
		// |	</div>
		// example:
		// |	// Programmatic use-case:
		// |	// SearchBox and ScrollableView provided by the user.
		// |	// Filtered EdgeToEdgeStoreList created programmatically.
		// |	require(["dojo/_base/declare", "dojo/ready", "dui/registry",
		// |			"dui/mobile/EdgeToEdgeStoreList", "dui/mobile/FilteredListMixin",
		// |			"dui/mobile/ScrollableView", ...], function(declare, ready, registry, ...){
		// |		ready(function(){
		// |			var view = registry.byId("scrollableView");
		// |			var listWidget =
		// |				new declare([EdgeToEdgeStoreList, FilteredListMixin])(
		// |					{id:"list", filterBoxRef: 'filterBox', placeHolder: 'Search', store: myStore});
		// |			listWidget.placeAt(view.containerNode);
		// |			listWidget.startup();
		// |		});
		// |	});
		// |	...
		// |	<div data-dojo-type="dui/mobile/View">
		// |		<h1 data-dojo-type="dui/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<input id="filterBox" data-dojo-type="dui/mobile/SearchBox" type="search"
		// |			class="duiFilteredEdgeToEdgeListSearchBox">		
		// |		<div id="scrollableView" data-dojo-type="dui/mobile/ScrollableView">
		// |	</div>

		// Implementation notes:
		// - The mixin requires dui/mobile/ScrollableView statically. It could be required
		// dynamically, only when needed, that is in the use-case when the mixin creates the 
		// ScrollableView by itself. But this would create an usability trouble: if the user 
		// would want to get the instance of ScrollableView in a dojo/ready (say, for configuring
		// it), he would need to require it upfront, to cope with the case of asynchronous 
		// loading. Thus, requiring it statically has been preferred, because it avoids this
		// constraint on user's side and it is not a serious overhead, because in practice 
		// the filtering is used for long lists, for which a ScrollableView is anyway likely 
		// to be used. 
		// - Differently, the loading of the store modules is performed dynamically,
		// in order to avoid their overhead when they are not actually needed.
		
		// filterBoxRef: String
		//		The reference for the search box allowing to enter the filtering criteria.
		//		Only used at construction time:
		//		- If unspecified, the mixin creates a dui/mobile/SearchBox and 
		//		a dui/mobile/ScrollableView. The list is placed inside the ScrollableView and the
		//		SearchBox, wrapped in a DIV, is placed on top of the ScrollableView.
		//		- If the string is the id of a widget which is an instance of dui/mobile/SearchBox 
		//		or a subclass, the mixin uses this SearchBox for filtering the list.
		//		- If the id is specified but does not reference a dui/mobile/SearchBox or 
		//		subclass, an error is thrown. 
		filterBoxRef: null,
		
		// placeHolder: String
		//		Defines a hint to help users fill out the input field (as defined in HTML 5) of the 
		//		dui/mobile/SearchBox. This should only contain plain text	(no HTML markup).
		//		When the SearchBox is provided by the user (not created by this mixin), its placeHolder
		//		property takes precedence.
		placeHolder: "",
		
		// filterBoxVisible: Boolean
		//		A flag which allows to show or hide the dui/mobile/SearchBox associated with
		//		the list.
		filterBoxVisible: true,
		
		// _filterBox: [private] dui/mobile/SearchBox
		//		The instance of dui/mobile/SearchBox used by this mixin. 
		//		Stored for getFilterBox().
		_filterBox: null,
		
		// _createdFilterBox: [private] dui/mobile/SearchBox
		//		The instance of dui/mobile/SearchBox created by this mixin, or null if none
		//		has been created. Stored for being able to destroy it together with the list widget.
		_createdFilterBox: null,
		
		// _createdScrollableView: [private] dui/mobile/ScrollableView
		//		The instance of dui/mobile/ScrollableView created by this mixin, if any. 
		//		Stored for getScrollableView() and for being able to destroy it together 
		//		with the list widget.
		_createdScrollableView: null,
		
		startup: function(){
			if(this._started){ return; }
			
			this.inherited(arguments);
			
			if(this.filterBoxRef){
				// Case #1: search box provided by the user
				this._filterBox = registry.byId(this.filterBoxRef);
				
				if (this._filterBox && this._filterBox.isInstanceOf(SearchBox)){ 
					// If the list is backed by a dui/mobile/_StoreListMixin, it
					// has a labelAttr which is given precedence.
					this._filterBox.set("searchAttr", this.labelAttr ? this.labelAttr : "label");
					if(!this._filterBox.placeHolder){
						// Give precedence to the placeHolder that may be specified on the provided SearchBox
						this._filterBox.set("placeHolder", this.placeHolder);
					}
					this._filterBox.on("search", lang.hitch(this, "_onFilter"));
				}else{
					throw new Error("Cannot find a widget of type dui/mobile/SearchBox or subclass " +
						"at the specified filterBoxRef: " + this.filterBoxRef);
				}
			}else{ 
				// Case #2: automatic mode. The mixin creates a SearchBox and a ScrollableView.
				this._filterBox =
					new SearchBox({
						// If the list is backed by a dui/mobile/_StoreListMixin, it
						// has a labelAttr which is given precedence.
						searchAttr: this.labelAttr ? this.labelAttr : "label",
						ignoreCase: true,
						incremental: true,
						onSearch: lang.hitch(this, "_onFilter"),
						selectOnClick: true,
						placeHolder: this.placeHolder
				});
				
				// Store them to be able to destroy them together with the list (see destroy()).
				this._createdFilterBox = this._filterBox; 
				this._createdScrollableView = new ScrollableView();
				
				var currentDomNode = this.domNode,
					listParentNode = this.domNode.parentNode;
				listParentNode.replaceChild(this._createdScrollableView.domNode, this.domNode);
				// Put the list inside the ScrollableView:
				domConstruct.place(currentDomNode, this._createdScrollableView.containerNode);
				
				var searchBoxParentDiv = domConstruct.create("div");
				// Put the SearchBox as child of the DIV 
				domConstruct.place(this._createdFilterBox.domNode, searchBoxParentDiv);
				// Put the DIV as sibling of the ScrollableView: 
				domConstruct.place(searchBoxParentDiv, this._createdScrollableView.domNode, "before");
					
				if(this.filterBoxClass){
					// Only adding the class when the mixin creates the SearchBox by itself.
					domClass.add(searchBoxParentDiv, this.filterBoxClass);
				}
					
				this._createdFilterBox.startup();
				this._createdScrollableView.startup();
				this._createdScrollableView.resize();
			}
			
			// Do not use this.getScrollableView() here, because this doesn't cover the
			// use-case when the scrollable is not created by this mixin.
			var sv = viewRegistry.getEnclosingScrollable(this.domNode);
			if(sv){
				this.own(aspect.after(sv, "onFlickAnimationEnd", lang.hitch(this, function(){
					if(!this._filterBox.focusNode.value){ // if search criteria is empty
						// store the scroll position such that we can reset the 
						// initial scroll when the user goes back to the unfiltered
						// list (as done by some native mobile apps). 
						this._previousUnfilteredScrollPos = sv.getPos();
					}
				})));
			}
			
			if(!this.store){
				this._createStore(this._initStore);
			}else{
				this._initStore();
			}
		},
		
		_setFilterBoxVisibleAttr: function(/* Boolean */ visible){
			// tags:
			//		private
			this._set("filterBoxVisible", visible);
			if (this._filterBox && this._filterBox.domNode){
				this._filterBox.domNode.style.display = visible ? "" : "none";
			}
		},
		
		_setPlaceHolderAttr: function(/* String */ placeHolder){
			// tags:
			//		private
			this._set("placeHolder", placeHolder);
			if (this._filterBox){ // allow update after construction time
				this._filterBox.set("placeHolder", placeHolder);
			}
		},
		
		getFilterBox: function(){
			// summary:
			//		Returns the dui/mobile/SearchBox widget used for entering the filtering criteria.
			//		If an instance has been referenced at construction time using the property filterBoxRef,
			//		this instance is returned. Otherwise, returns the instance created by the mixin.
			//		This function allows the user to get the instance of SearchBox in order to customize
			//		its parameters. 
			return this._filterBox;
		},
		
		getScrollableView: function(){
			// summary:
			//		Returns the instance of dui/mobile/ScrollableView created by this mixin,
			//		or null if none has been created. The mixin creates a ScrollableView if and
			//		only if the property filterBoxRef is unspecified.
			//		This function allows the user to get the instance of ScrollableView in order to
			//		customize its parameters.
			return this._createdScrollableView;
		},
		
		_initStore: function(){
			// description:
			//		Initializes the store.
			// tags:
			//		private
			this._filterBox.store = this.store;
		},
	
		_createStore: function(initStoreFunction/* Function */){
			// summary:
			//		Creates the store.
			// description:
			//		This method is used when the list is not backed by a store. In this case,
			//		a store is created and filled with items containing the text of the list items.
			// tags:
			//		private
			require(["./_StoreListMixin", "dojo/store/Memory"], lang.hitch(this, function(module, Memory){
				declare.safeMixin(this, new module());
					
				this.append = true; // to avoid that _StoreListMixin.generateList destroys the items
					
				// _StoreListMixin.createListItem creates a new item. Instead, we want to reuse the
				// original item instance, hence:
				this.createListItem = function(/*Object*/item){
					return item.listItem;
				};
					
				aspect.before(this, "initItems", function(){
					// remove all children
					this.getChildren().forEach(function(child){
						child.domNode.parentNode.removeChild(child.domNode);
					});
				});
					
				// Collect the text from the list items
				var items = [];
				var text = null;
				this.getChildren().forEach(function(child){
					text = child.label ? child.label : (child.domNode.innerText || child.domNode.textContent);
					items.push({label: text, listItem: child});
				});
				var listData = {items: items};
				// store for the dui/mobile/EdgeToEdgeStoreList
				var store = new Memory({data: listData});
				this.store = null;
				this.query = {};
				this.set("store", store);
				this.set("query", this.query);
				this.set("queryOptions", this.queryOptions);
				lang.hitch(this, initStoreFunction)();
			}));
		},
		
		_onFilter: function(results, query, options){
			// summary:
			//		Internal handler for filtering events.
			// tags:
			//		private
			if(this.onFilter(results, query, options) === false){ return; } // user's filtering action
			this.set("query", query);
			
			// Do not use this.getScrollableView() because this doesn't cover the
			// use-case when the scrollable is not created by this mixin.
			var sv = viewRegistry.getEnclosingScrollable(this.domNode);
			if(sv){
				// When the user goes back to the unfiltered list, restore the previous 
				// scroll position stored for unfiltered list (as done by some native mobile apps).
				// Otherwise, reset the scroll position, to ensure that the new subset of 
				// items is visible. 
				sv.scrollTo(this._filterBox.focusNode.value ?
					{x:0, y:0} :
					this._previousUnfilteredScrollPos || {x:0, y:0});
			}
		},
		
		onFilter: function(/*===== results, query, options =====*/){
			// summary:
			//		User-defined function to handle filter actions. If the function returns false,
			//		the filtering is cancelled.
			// tags:
			//		callback
		},
		
		destroy: function(/*Boolean?*/ preserveDom){
			// summary:
			//		Destroys the widget. If the list has created dui/mobile/SearchBox 
			//		or dui/mobile/ScrollableView widgets, these widgets are also destroyed.
			// preserveDom: Boolean
			//		If true, this method will leave the original DOM structure alone.
		
			this.inherited(arguments);
			
			// Only destroy widgets created (thus, owned) by this mixin (if any).
			if(this._createdFilterBox){ 
				this._createdFilterBox.destroy(preserveDom);
				this._createdFilterBox = null;
			}
			if(this._createdScrollableView){ 
				this._createdScrollableView.destroy(preserveDom);
				this._createdScrollableView = null;
			}
		}
	});
});
