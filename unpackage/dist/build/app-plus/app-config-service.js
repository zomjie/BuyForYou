
  ;(function(){
  let u=void 0,isReady=false,onReadyCallbacks=[],isServiceReady=false,onServiceReadyCallbacks=[];
  const __uniConfig = {"pages":[],"globalStyle":{"backgroundColor":"#F8F8F8","navigationBar":{"backgroundColor":"#F8F8F8","titleText":"uni-app","type":"default","titleColor":"#000000"},"isNVue":false},"nvue":{"compiler":"uni-app","styleCompiler":"uni-app","flex-direction":"column"},"renderer":"auto","appname":"BuyForYou","splashscreen":{"alwaysShowBeforeRender":true,"autoclose":true},"compilerVersion":"4.45","entryPagePath":"pages/tabbar/index/index","entryPageQuery":"","realEntryPagePath":"","networkTimeout":{"request":60000,"connectSocket":60000,"uploadFile":60000,"downloadFile":60000},"tabBar":{"position":"bottom","color":"#7A7E83","selectedColor":"#3cc51f","borderStyle":"black","blurEffect":"none","fontSize":"10px","iconWidth":"24px","spacing":"3px","height":"50px","list":[{"pagePath":"pages/tabbar/index/index","iconPath":"/static/images/index.png","selectedIconPath":"/static/images/index_selected.png","text":"首页"},{"pagePath":"pages/tabbar/order/order","iconPath":"/static/images/order.png","selectedIconPath":"/static/images/order_selected.png","text":"订单"},{"pagePath":"pages/tabbar/mine/mine","iconPath":"/static/images/mine.png","selectedIconPath":"/static/images/mine_selected.png","text":"我的"}],"backgroundColor":"#ffffff","selectedIndex":0,"shown":true},"locales":{},"darkmode":false,"themeConfig":{}};
  const __uniRoutes = [{"path":"pages/tabbar/index/index","meta":{"isQuit":true,"isEntry":true,"isTabBar":true,"tabBarIndex":0,"navigationBar":{"titleText":"","style":"custom","type":"default"},"isNVue":false}},{"path":"pages/tabbar/order/order","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":1,"enablePullDownRefresh":false,"navigationBar":{"backgroundColor":"#ff9800","titleText":"订单","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/tabbar/mine/mine","meta":{"isQuit":true,"isTabBar":true,"tabBarIndex":2,"enablePullDownRefresh":false,"navigationBar":{"backgroundColor":"#ff9800","titleText":"个人中心","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/admin/merchant-audit/merchant-audit","meta":{"navigationBar":{"backgroundColor":"#ff9800","titleText":"商家审核","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/admin/complaints/complaints","meta":{"navigationBar":{"backgroundColor":"#ff9800","titleText":"投诉管理","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/admin/blacklist/blacklist","meta":{"enablePullDownRefresh":true,"navigationBar":{"backgroundColor":"#ff9800","titleText":"黑名单管理","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/user/deliveries/deliveries","meta":{"navigationBar":{"backgroundColor":"#ff9800","titleText":"配送记录","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/merchant/dishes/dishes","meta":{"navigationBar":{"backgroundColor":"#ff9800","titleText":"菜品管理","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/user/orders/orders","meta":{"navigationBar":{"backgroundColor":"#ff9800","titleText":"我的订单","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/user/complaints/complaints","meta":{"enablePullDownRefresh":true,"navigationBar":{"titleText":"投诉记录","type":"default"},"isNVue":false}},{"path":"pages/user/settings/settings","meta":{"navigationBar":{"backgroundColor":"#ff9800","titleText":"个人设置","type":"default","titleColor":"#ffffff"},"isNVue":false}},{"path":"pages/merchant/settings/settings","meta":{"navigationBar":{"backgroundColor":"#ff9800","titleText":"店铺设置","type":"default","titleColor":"#ffffff"},"isNVue":false}}].map(uniRoute=>(uniRoute.meta.route=uniRoute.path,__uniConfig.pages.push(uniRoute.path),uniRoute.path='/'+uniRoute.path,uniRoute));
  __uniConfig.styles=[];//styles
  __uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
  __uniConfig.onServiceReady=function(callback){if(__uniConfig.serviceReady){callback()}else{onServiceReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"serviceReady",{get:function(){return isServiceReady},set:function(val){isServiceReady=val;if(!isServiceReady){return}const callbacks=onServiceReadyCallbacks.slice(0);onServiceReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
  service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:16})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,global:u,window:u,document:u,frames:u,self:u,location:u,navigator:u,localStorage:u,history:u,Caches:u,screen:u,alert:u,confirm:u,prompt:u,fetch:u,XMLHttpRequest:u,WebSocket:u,webkit:u,print:u}}}}); 
  })();
  