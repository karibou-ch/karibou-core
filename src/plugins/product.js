;(function(angular) {'use strict';

//
// Define the Product module (app.product)  for controllers, services and models
// the app.product module depend on app.config and take resources in product/*.html 
angular.module('app.product', ['app.config', 'app.api','app.ui','app.product.ui'])
  .config(productConfig)
  .factory('product',productFactory);


//
// define all routes for user api
productConfig.$inject=['$routeProvider','$locationProvider','$httpProvider'];
function productConfig($routeProvider, $locationProvider, $httpProvider){

  // List of routes of the application
  $routeProvider
    .when('/products/create', {
        title:'Créer un nouveau produit ',clear:true, modal:true, view:'modal',controller:'ProductCtrl', templateUrl : '/partials/product/create.html'
     })
    .when('/shop/:shop/products/create', {
        title:'Créer un nouveau produit ',clear:true, modal:true, view:'modal',controller:'ProductCtrl', templateUrl : '/partials/product/create.html'
     })
    .when('/products/category/:category', {
        title:'Les produits ',  templateUrl : '/partials/product/products.html'
    })
    .when('/shop/:shop/products/:sku/edit', {
        title:'Votre produit ', modal:true, edit:true, view:'modal',controller:'ProductCtrl', templateUrl : '/partials/product/create.html'
     })
    .when('/products/:sku/edit', {
        title:'Votre produit ', modal:true, edit:true, view:'modal',controller:'ProductCtrl', templateUrl : '/partials/product/create.html'
     })
    .when('/products/:sku/:title?', {
        modal:true,view:'modal',controller:'ProductCtrl', templateUrl : '/partials/product/product-wide.html'
     })
    .when('/shop/:shop/products/:sku/:title?', {
        modal:true,view:'modal',controller:'ProductCtrl', templateUrl : '/partials/product/product-wide.html'
     });
}


/**
 * app.product provides a model for interacting with Product.
 * This service serves as a convenient wrapper for other related services.
 */
productFactory.$inject=['config','$rootScope','$resource','$q','api'];
function productFactory (config, $rootScope,$resource,$q,api) {
  var _products;

  //
  // update the products that bellongs to this shop    
  $rootScope.$on("shop.update",function(e,shop){      
    var p=_products.findAll();
    for (var i in p)if(p[i].vendor.urlpath===shop.urlpath){
      p[i].vendor=shop;
    }      
  });

  //
  // wrap plain json object 
  $rootScope.$on("product.wrap",function(e,products){
    //
    // array
    if(products.length){
      return _products.wrapArray(products).forEach(function (p,i) {
        products[i]=p;
      });
    }
    //
    // singleton
    angular.extend(products,_products.wrap(products));
  });      



  var defaultProduct = {
    image:'',
    categories:[],
    details:{},
    attributes:{
      available:false
    },
    pricing:{},
    photo:{}
  };
  
    //
    // this is the restfull backend for angular 
  var backend={
    products:$resource(config.API_SERVER+'/v1/products/:sku/:category',
        {sku:'@sku',category:'@id'}, {
        get:{method:'GET',isArray:false},
        query:{method:'GET',isArray:true},
        update: {method:'POST'},
        delete: {method:'PUT'},
    }),
    shop:$resource(config.API_SERVER+'/v1/shops/:shopname/products',
        {shopname:'@shopname'}, {
        update: {method:'POST'},
        delete: {method:'PUT'},
    })
  };

  //
  // default behavior on error
  var onerr=function(data,config){
    //FIXME on error reset product
    //_product.copy(defaultProduct);
  };
  
  var Product = function(data) {
    angular.extend(this, defaultProduct, data);

    //
    // wrap promise to this object
    this.$promise=$q.when(this);

  };


  Product.prototype.hasFixedPortion=function(){
      var weight=this.pricing.part||'';
      var m=weight.match(/~([0-9.]+) ?(.+)/);
      return(!m||m.length<2);
  };

  Product.prototype.getPrice=function(){
    if(this.attributes.discount && this.pricing.discount)
      return this.pricing.discount;
    return this.pricing.price;
  };    

  Product.prototype.isDiscount=function(){
    return(this.attributes.discount && this.pricing.discount);
  };    

  Product.prototype.isAvailableForOrder = function() {
    var ok=(this.attributes.available && this.vendor &&
            this.vendor.status===true);
    return ok;
  };


  //
  // REST api wrapper
  //

  function products_wrap_dates (product) {
    product.updated=new Date(product.updated);
    product.created=new Date(product.created);
  }
  
  Product.prototype.home = function(shop,filter,cb,err) {
    if(!err) err=onerr;
    var products, 
        s, 
        product=this, 
        params=(shop)?{shopname:shop}:{}, 
        rest=(shop)?backend.shop:backend.products;

    angular.extend(params,filter);
    s=rest.get(params, function() {
      products={};
      for (var group in s){
        products[group]=[];
        if (Array.isArray(s[group]) && typeof s[group][0]==="object"){
          products[group]=product.wrapArray(s[group]);
          //
          // wrap dates for sorting !!!
          products[group].forEach(products_wrap_dates);
        }
      }
      if(cb)cb(products);
    },err);
    return products;
  };

  
  Product.prototype.query = function(filter,cb,err) {
    if(!err) {err=onerr;}
    var products, s,product=this;
    var rest=(filter.shopname)?backend.shop:backend.products;

    s=backend.products.query(filter, function() {
      products=product.wrapArray(s);

      //
      // wrap dates for sorting !!!
      products.forEach(products_wrap_dates);

      if(cb)cb(products);
    },err);
    return products;
  };


  Product.prototype.findLove = function(body,cb,err) {
    if(!err) {err=onerr;}
    var products;
    var params=angular.extend({},{sku:'love'},body||{});
    var self=this, s=backend.products.query(params,function() {
      products=self.wrapArray(s);
      //
      // wrap dates for sorting !!!
      products.forEach(products_wrap_dates);

      if(cb)cb(products);
      return self;
    },err);
    return self;
  };

  Product.prototype.findSearch = function(body,cb,err) {
    if(!err) {err=onerr;}
    var products;
    var params=angular.extend({},{sku:'search'},body||{q:'hello fresh'});
    var self=this, s=backend.products.query(params,function() {
      products=self.wrapArray(s);
      //
      // wrap dates for sorting !!!
      products.forEach(products_wrap_dates);

      if(cb)cb(products);
      return self;
    },err);
    return self;
  };


  Product.prototype.findByCategory = function(cat, filter,cb,err) {
    if(!err) err=onerr;
    var products, s,product=this, params={sku:'category'};
    angular.extend(params,{category:cat},filter);

    s=backend.products.query(params, function() {
      products=product.wrapArray(s);
      //
      // wrap dates for sorting !!!
      products.forEach(products_wrap_dates);

      if(cb)cb(products);
    },err);
    return products;
  };


  Product.prototype.get = function(sku,cb,err) {
    if(!err) err=onerr;
    
    var loaded=Product.find(sku);if (loaded){
      if(cb)cb(loaded);
      return loaded;
    }
    
    var product=this, s=backend.products.get({sku:sku},function() {
      if(cb)cb(product.wrap(s));
    },err);
    return this;
  };


  Product.prototype.updateAndSave = function( cb, err){
    if(!err) err=onerr;
    // stock has been modified
    if(this.pricing._stock){
      this.pricing.stock=parseInt(this.pricing._stock);
      // this.pricing._stock=undefined
    }

    // price has been modified
    if(this.pricing._price){
      this.pricing.price=(this.pricing._price);
    }

    // weight has been modified
    if(this._weight){
      this.weight=(this._weight);
    }


    var product=this, s=backend.products.save({sku:this.sku},this, function() {
      $rootScope.$broadcast("product.update",s);
      if(cb)cb(product);
    },err);
    return this;
  };

  Product.prototype.save = function( cb, err){
    if(!err) err=onerr;
    var product=this, s=backend.products.save({sku:this.sku},this, function() {
      $rootScope.$broadcast("product.update",s);
      if(cb)cb(product);
    },err);
    return this;
  };

  Product.prototype.create=function(shop, p,cb,err){
    if(!err) err=function(){};
    var product=this, s = backend.shop.save({shopname:shop},p, function() {
      product.wrap(s);
      if(cb)cb(product);
    },err);
    return this;
  };    
  
  Product.prototype.remove=function(password,cb,err){
    if(!err) err=function(){};
    var product=this, s = backend.products.delete({sku:this.sku},{password:password},function() {
      if(cb)cb(product);
    },err);
    return this;
  };    
 
  _products=api.wrapDomain(Product, 'sku', defaultProduct);  
  return _products;
}


})(window.angular);
