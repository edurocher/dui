define(function(){ return '\
.duiScaleOut.duiOut {\
  -webkit-animation-duration: 0.5s;\
  animation-duration: 0.5s;\
  -webkit-animation-name: duiScaleOutOut;\
  animation-name: duiScaleOutOut;\
  -webkit-animation-timing-function: ease-in;\
  animation-timing-function: ease-in;\
}\
.dj_android .duiScaleOut.duiOut {\
  -webkit-animation-name: duiScaleOutOutAndroid;\
  animation-name: duiScaleOutOutAndroid;\
}\
.duiScaleOut.duiIn {\
  z-index: -100;\
  -webkit-animation-duration: 0.5s;\
  animation-duration: 0.5s;\
  -webkit-animation-name: duiScaleOutIn;\
  animation-name: duiScaleOutIn;\
  -webkit-animation-timing-function: ease-in;\
  animation-timing-function: ease-in;\
}\
@-webkit-keyframes duiScaleOutOut {\
  from {\
    -webkit-transform: scale(1);\
    opacity: 1;\
  }\
  to {\
    -webkit-transform: scale(0);\
    opacity: 0;\
  }\
}\
@keyframes duiScaleOutOut {\
  from {\
    transform: scale(1);\
    opacity: 1;\
  }\
  to {\
    transform: scale(0);\
    opacity: 0;\
  }\
}\
@-webkit-keyframes duiScaleOutOutAndroid {\
  from {\
    -webkit-transform: scale(1);\
  }\
  to {\
    -webkit-transform: scale(0);\
  }\
}\
@keyframes duiScaleOutOutAndroid {\
  from {\
    transform: scale(1);\
  }\
  to {\
    transform: scale(0);\
  }\
}\
@-webkit-keyframes duiScaleOutIn {\
  from {\
    -webkit-transform: scale(1);\
  }\
  to {\
    -webkit-transform: scale(1);\
  }\
}\
@keyframes duiScaleOutIn {\
  from {\
    transform: scale(1);\
  }\
  to {\
    transform: scale(1);\
  }\
}\
'; } );
