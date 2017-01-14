/**
 * @ngdoc service
 * @name karibouCoreMocks.cordovaGoogleAnalytics
 *
 * @description
 * A service for testing google analytics services
 * in an app build with karibouCore.
 */
karibouCoreMocks.factory('$cordovaGoogleAnalytics', ['$q', function ($q) {
  var throwsError = false;
  var methods = {};

  /**
   * @ngdoc property
   * @name throwsError
   * @propertyOf karibouCoreMocks.cordovaGeolocation
   *
   * @description
   * A flag that signals whether a promise should be rejected or not.
   * This property should only be used in automated tests.
   **/
  methods.throwsError = throwsError;

  var methodsName = [
    'startTrackerWithId',
    'setUserId',
    'debugMode',
    'trackView',
    'addCustomDimension',
    'trackEvent',
    'trackException',
    'trackTiming',
    'addTransaction',
    'addTransactionItem'
  ];

  methodsName.forEach(function (funcName) {
    methods[funcName] = function () {
      var defer = $q.defer();

      (this.throwsError) ?
        defer.reject() :
        defer.resolve();

      return defer.promise;
    };
  });

  return methods;
}]);
