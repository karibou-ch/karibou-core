;(function(angular) {'use strict';


angular.module('app.api',['app.config','app.ui'])
  .factory('domain',domainFactory);


domainFactory.$inject=['$rootScope','$http','$resource','$timeout','$q','$log','config'];
function domainFactory($rootScope, $http, $resource, $timeout, $q, $log, $config) {
  function Clazz(){

  }

  Clazz.prototype.copy = function(data) {
      angular.extend(this,defaultClazz, data);
  };

  //
  // default behavior on error
  Clazz.prototype.onerr=function(data,config){
    this.copy(defaultClazz);
  };

  /**
   * chain a Object resource as the next promise
   */
  Clazz.prototype.chain=function(promise){
    var self=this;
    this.$promise=this.$promise.then(function(data){
      if(Array.isArray(data))self.wrapArray(data);else self.wrap(data);
      return promise;
    });
    return this;
  };

  /**
   * chain a Array resource as the next promise
   */
  Clazz.prototype.chainAll=function(promise){
    var self=this,
        deferred=$q.defer(),
        lst=[];
        
    this.$promise=lst.$promise=this.$promise.then(function(){
        return promise.then(function(l){
          lst=self.wrapArray(l);
          return lst;
        });
    });
    return lst;
  };

  /**
   * wrap json data to Object instance repository
   */
  Clazz.prototype.wrapArray=function(values){
    var list=[];
    values.forEach(function(instance){
      //
      // manage cache on multiple instance
      if(!_all[instance[key]]){
        _all[instance[key]]=new Clazz();          
      }
      _all[instance[key]].copy(instance);
      list.push(_all[instance[key]]);
    });
    return list;  
  };
  
  
  Clazz.prototype.wrap=function(instance){
    this.copy(instance);
    return this;
  };

  Clazz.prototype.delete=function(){
    if(_all[this[key]]) delete _all[this[key]];
  };


  
  /**
   * find data in repository 
   */
  Clazz.findAll=function(where, cb){
    if (!where){
      return Object.keys(_all).map(function(key) {
        return _all[key];
      });
      // return _.map(_all, function(val,key){return val;});
    }
    var lst=_.where(_all,where);
    if(cb)cb(lst);
    return lst;
  };

  Clazz.prototype.findAll=function(where){ 
    return Clazz.findAll(where);
  };

  Clazz.prototype.find=function(where){ 
    return Clazz.find(where);
  };

  Clazz.find=function(where,cb){
    if (!where){ 
      return;
    }
    var lst;
    if ((typeof where) === "object"){
      lst=_.findWhere(_all,where);
    }else{
      lst=_all[where];
    }
    if(cb)cb(lst);      
    return lst;
  };
  
  Clazz.load=function(elems){
    if (!elems) {
      return Object.keys(_all).map(function(key) {
        return _all[key];
      });
      // return _.map(_all, function(val,key){return val;});
    }
    var list=_singleton.wrapArray(elems);
    return list;
  };
  //
  //default singleton for user 
  var     _singleton=new Clazz({});
  var     _all={};
  return _singleton;  
}

Service.factory('api', [
  '$rootScope','$http','$resource','$timeout','$q','$log','$location','$routeParams','config','Flash',
function ($rootScope, $http, $resource, $timeout, $q, $log, $location, $routeParams, config, Flash) {  
  var _categories=[], promise;
  var isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };

  /**
   * get category object
   */
  function findBySlug(slug){
    var cats=_categories;
    for (var i in cats){
      if(cats[i].slug===slug)return cats[i].name;
    }
    return "Inconnu";
  }
  
  function info($scope, msg, ms, cb){
    console.log('info',msg)
    Flash.create('success', msg, 'custom-class');
    cb&&$timeout(cb,ms||0);
  }


  function error(msg, ms, cb){
    Flash.create('danger', msg);
  }  
  

  function uploadfile($scope, options, callback){
    return false;      
  }


  function computeUrl(forceUrl){
    var url, path=$location.path();

    if(forceUrl){
      return forceUrl;
    }

    // edit from shop
    if($routeParams.shop && $routeParams.sku && path.indexOf('/edit')!=-1){
      url='/shop/'+$routeParams.shop+'/products/'+$routeParams.sku;
    }

    // edit from products
    else if($routeParams.sku && path.indexOf('/edit')!=-1){
      url='/products/'+$routeParams.sku;
    }

    // from shop
    else if($routeParams.shop){
      url='/shop/'+$routeParams.shop;
    }

    // from category 
    else if($routeParams.category){
      url='/products/category/'+$routeParams.category;
    }



    // from sku
    else if($routeParams.sku){
      if(referrers&&referrers.length){
        for (var i = referrers.length - 1; i >= 0; i--) {
          if(referrers[i].indexOf('/products/category')!==-1){
            url=referrers[i];
            break;
          }
        }
      }

      url=url||'/products';
    }

    // console.log('close -------------------',url||referrer||'/')

    return url||referrer||'/';      
  }

  
  //
  // TODO use better way to wrap JSON to javascript object
  // - http://www.joelambert.co.uk/article/offline-first-a-better-html5-user-experience/
  //
  function wrapDomain(clazz, key, defaultClazz){



  }
  return {
    detect:isMobile,
    uploadfile:uploadfile,
    wrapDomain:wrapDomain,
    findBySlug:findBySlug,
    computeUrl:computeUrl,
    error:error,
    info:info
  };
}]);
  


})(window.angular);


