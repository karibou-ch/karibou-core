;(function(angular) {'use strict';

//
// Define the Category module (app.shop)  for controllers, services and models
// the app.shop module depend on app.config and take resources in shop/*.html 
angular.module('app.category', ['app.config', 'app.api','$strap'])
  .config(categoryConfig)
  .factory('category', categoryService);

//
// define all routes for user api
categoryConfig.$inject=['$routeProvider','$locationProvider','$httpProvider'];
function categoryConfig($routeProvider, $locationProvider, $httpProvider) {

  // List of routes of the application
  $routeProvider
    .when('/admin/category', {title:'Admin of category ', _view:'main', templateUrl : '/partials/dashboard/dashboard-category.html'});
}

/**
 * app.shop provides a model for interacting with Category.
 * This service serves as a convenient wrapper for other related services.
 */

categoryService.$inject=['config','$location','$rootScope','$routeParams','$resource','api'];
function categoryService(config, $location, $rootScope, $routeParams,$resource, api) {

  var defaultCategory = {
    name:'',
    weight:0,
    description:"",
    group:""
  };
  
  //
  // default behavior on error
  var onerr=function(data,config){
    _category.copy(defaultCategory);
  };


  var Category = function(data) {
    //
    // this is the restfull backend for angular 
    this.backend=$resource(config.API_SERVER+'/v1/category/:category',
          {category:'@id'}, {
          update: {method:'POST'},
          delete: {method:'PUT'},
    });
    angular.extend(this, defaultCategory, data);
  };

  Category.prototype.getCurrent = function(){
    if(!$routeParams.category)
      {return;}
    return this.find({slug:$routeParams.category});
  };
  

  Category.prototype.findNameBySlug = function(slug){
    var cat=this.find({slug:slug});
    if (cat) {return cat.name;} else {return "Inconnu";}      
  };

  Category.prototype.findBySlug = function(slug){
    return this.find({slug:slug});
  };

  Category.prototype.select = function(filter,cb,err) {
    if(!err){ err=onerr;}
    var categories=[];
    var c=this.backend.query(filter, function() {
      categories=Category.load(c);
      if(cb){cb(categories);}
    },err);
    return categories;
  };


  Category.prototype.get = function(slug,cb,err) {
    if(!err) {err=onerr;}
    var loaded=Category.find({slug:slug});if (loaded){
      if(cb){cb(loaded);}
      return loaded;
    }
    
    var category=this, c=this.backend.get({category:slug},function() {
      category.wrap(s);
      if(cb){cb(category);}
    },err);
    return category;
  };


  Category.prototype.save = function(cb, err){
    //console.log("model",this.photo)

    if(!err){ err=onerr;}
    var category=this, s=this.backend.save({category:this.slug},this, function() {
      category.wrap(s);
      if(cb){cb(category);}
    },err);
    return category;
  };

  Category.prototype.create=function(cat, cb,err){
    if(!err) {err=function(){};}
    var category=this, s = this.backend.save(cat, function() {
      category=category.wrap(s);
      if(cb){cb(category);}
    },err);
    return category;
  };    
  
  Category.prototype.remove=function(password, cb,err){
    if(!err) {err=function(){};}
    var category=this, s = this.backend.delete({category:this.slug},{password:password},function() {
      if(cb){cb(category);}
    },err);
    return category;
  };    
 
  var _category=api.wrapDomain(Category,'slug', defaultCategory);  
  return _category;
}


})(window.angular);
