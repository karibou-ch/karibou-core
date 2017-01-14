;(function(angular) {'use strict';

//
// Define the Document module (app.document)  for controllers, services and models
// the app.document module depend on app.config and take resources in document/*.html 
angular.module('app.document', ['app.config','app.document.ui'])
  .factory('documents',docFactory);


/**
 * app.document provides a model for interacting with Document.
 * This service serves as a convenient wrapper for other related services.
 */
docFactory.$inject=['config','$resource','$q','$rootScope','api','user','product'];
function docFactory(config, $resource, $q,$rootScope, api,user,product) {
  var _documents;


  var defaultDocument = {
    title:{fr:'Titre'},
    header:{fr:'En tête'},
    content:{fr:'Contenu'},
    photo:{
      bundle:[]
    },
    available:false,
    published:false,
    skus:[],
    style:undefined,
    type: undefined
  };

  //
  // fetch user info trigger  
  $rootScope.$on("user.init",function(u){
    if(!user.isAuthenticated()){
      return user.documents=[];  
    }
    defaultDocument.signature=user.display();
    user.documents=_documents.my().models;
  });      


  
  //
  // this is the restfull backend for angular 
  // - /v1/documents/skus/:skus
  // - /v1/documents/category/:category
  // - /v1/documents/:slug
  // - /v1/documents'
  var backend={  
    documents:$resource(config.API_SERVER+'/v1/documents/:slug/:param',
      {slug:'@slug'}, {
      findBySkus:{method:'GET',isArray:true,params:{slug:'skus'}},
      findByCategory:{method:'GET',isArray:true,params:{slug:'category'}},
      get:{method:'GET',isArray:false},
      update: {method:'POST'},
      delete: {method:'PUT'},
    })
  };

  var Document = function(data) {
    this.model={};
    this.models=[];
    angular.extend(this.model, defaultDocument, data);

    //
    // wrap promise to this object
    this.$promise=$q.when(this);

  };


  Document.prototype.getCategories = function() {
    return config.shop.document.types;
  };

  Document.prototype.clear = function() {
    this.model={};
    angular.extend(this.model, defaultDocument,{signature:user.display()});
    return this;
  };

  Document.prototype.clearAll = function() {
    this.models=[];
    return this;
  };

  //
  // REST api wrapper
  //
  
  Document.prototype.findBySkus = function(skus) {
    this.models=backend.documents.findBySkus({skus:skus});
    return this;
  };

  Document.prototype.my = function() {
    this.models=backend.documents.query();
    return this;
  };


  Document.prototype.findByCategory = function(cat) {
    this.models=backend.documents.findByCategory({param:cat});
    return this;
  };


  Document.prototype.get = function(slug) {
    this.model=backend.documents.get({slug:slug});
    this.model.$promise.then(function (d) {
      $rootScope.$broadcast("product.wrap",d.products);
    })
    return this;
  };


  Document.prototype.save = function(doc){
    if(!doc){
      this.model.skus=_.uniq(this.model.skus);
      this.model.$save();
      return this;
    }
    this.model=backend.documents.save({slug:doc.slug[0]},doc);
    return this;
  };

  Document.prototype.create=function(){
    this.model=backend.documents.save(this.model);
    return this;
  };    
  
  Document.prototype.remove=function(password,cb,err){
    this.model=this.model.$delete({password:password});
    return this;
  };    
 
  _documents=new Document();  
  return _documents;
}



})(window.angular);
