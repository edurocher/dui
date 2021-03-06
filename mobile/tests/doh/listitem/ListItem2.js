dojo.addOnLoad(function(){
	doh.register("dui.mobile.test.doh.ListItem", [
		{
			name: "ListItem Verification",
			timeout: 4000,
			runTest: function(){
				var d = new doh.Deferred();
				setTimeout(d.getTestCallback(function(){

					verifyListItem("dui_mobile_ListItem_0", 'Sounds', '', "duiDomButtonArrow", true, true, false, false, /i-icon-all.png/i, false, true);
					verifyListItemPos("dui_mobile_ListItem_0", "0px", "116px", "29px", "87px", "0px", "-87px", true);

					verifyListItem("dui_mobile_ListItem_1", 'Brightness', '', "duiDomButtonArrow", true, true, false, false, /i-icon-all.png/i, false, true);
					verifyListItemPos("dui_mobile_ListItem_1", "0px", "145px", "29px", "116px", "0px", "-116px", true);

					verifyListItem("dui_mobile_ListItem_2", 'XX Widget', '', "duiDomButtonBluePlus", true, true, false, false, /i-icon-all.png/i, false, true);
					verifyListItemPos("dui_mobile_ListItem_2", "0px", "116px", "29px", "87px", "0px", "-87px", true);

					verifyListItem("dui_mobile_ListItem_3", 'YY Widget', '', "duiDomButtonRedMinus", true, true, false, false, /i-icon-all.png/i, false, true);
					verifyListItemPos("dui_mobile_ListItem_3", "0px", "145px", "29px", "116px", "0px", "-116px", true);
				}));
				return d;
			}
		},
		{
			name: "ListItem set",
			timeout: 1000,
			runTest: function(){
				var demoWidget = dui.byId("dui_mobile_RoundRectList_0");
				demoWidget.set({iconBase :""});
				doh.assertEqual("", demoWidget.get("iconBase"));

				verifyListItem("dui_mobile_ListItem_0", 'Sounds', '', "duiDomButtonArrow", true, true, false, false, /i-icon-all.png/i, false, true);
				verifyListItemPos("dui_mobile_ListItem_0", "0px", "116px", "29px", "87px", "0px", "-87px", true);

				demoWidget = dui.byId("dui_mobile_EdgeToEdgeList_0");
				demoWidget.set({iconBase :""});
				doh.assertEqual("", demoWidget.get("iconBase"));

				verifyListItem("dui_mobile_ListItem_2", 'XX Widget', '', "duiDomButtonBluePlus", true, true, false, false, /i-icon-all.png/i, false, true);
				verifyListItemPos("dui_mobile_ListItem_2", "0px", "116px", "29px", "87px", "0px", "-87px", true);
			}
		}
	]);
	doh.run();
});
