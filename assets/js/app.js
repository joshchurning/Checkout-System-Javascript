angular.module('app', ['ui.bootstrap','formly', 'formlyBootstrap', 'ui.bootstrap.datetimepicker'])

.run(function(formlyConfig) {
    var ngModelAttrs = {};

    var attributes = [
      'ng-model',
      'min-date',
      'max-date',
      'date-disabled',
      'day-format',
      'month-format',
      'year-format',
      'year-range',
      'day-header-format',
      'day-title-format',
      'month-title-format',
      'date-format',
      'date-options',
      'hour-step',
      'minute-step',
      'show-meridian',
      'meridians',
      'readonly-time',
      'readonly-date',
      'hidden-time',
      'hidden-date',
      'mousewheel',
      'show-spinners',
      'current-text',
      'clear-text',
      'close-text'
    ];

    var bindings = [
      'ng-model',
      'min-date',
      'max-date',
      'date-disabled',
      'day-format',
      'month-format',
      'year-format',
      'year-range',
      'day-header-format',
      'day-title-format',
      'month-title-format',
      'date-format',
      'date-options',
      'hour-step',
      'minute-step',
      'show-meridian',
      'readonly-time',
      'readonly-date',
      'hidden-time',
      'hidden-date'
    ];

    angular.forEach(attributes, function(attr) {
      ngModelAttrs[camelize(attr)] = {
        attribute: attr
      };
    });

    angular.forEach(bindings, function(binding) {
      ngModelAttrs[camelize(binding)] = {
        bound: binding
      };
    });

    function camelize(string) {
      string = string.replace(/[\-_\s]+(.)?/g,

        function(match, chr) {
          return chr ? chr.toUpperCase() : '';
        });
      // Ensure 1st char is always lowercase
      return string.replace(/^([A-Z])/, function(match, chr) {
        return chr ? chr.toLowerCase() : '';
      });
    }

    formlyConfig.setType({
      name: 'datetimepicker',
      template: '<br><datetimepicker ng-model="model[options.key]" show-spinners="true" date-format="M/d/yyyy" date-options="dateOptions"></datetimepicker><br>',
      wrapper: ['bootstrapLabel'],
      defaultOptions: {
        ngModelAttrs: ngModelAttrs,
        templateOptions: {
          label: 'Time',
          minDate: '04/01/2016'
        }
      }
    });
  })

.controller('main', ['$scope', '$uibModal', function($scope, $uibModal){

    io.socket.on('newTransaction', function(event) {
      var expanded = $scope.show;
      $scope.show = [true];
      for (var i=0; i<expanded.length; i++) {
        $scope.show.push(expanded[i]);
      }
      console.log($scope.show);
        $scope.data = event; 

        $scope.$apply();
    });

    io.socket.post('/transactions/subscribe', function (resData) {
        console.log(resData);
    });

    $scope.newTransaction = function(data) {

        var modalInstance = $uibModal.open({
            templateUrl: 'modalTemplate.html',
            controller: 'newTransactionModalController',
            size: 'lg',
            resolve: { }
        });
    };

    $scope.getAllTransactions = function() {
        io.socket.get('/transactions/getAllTransactions', function (data) {
            $scope.data = data;
            console.log(data);
            $scope.$apply();
        })
    }
    
    $scope.getAllTransactions();

    $scope.show = [];

    $scope.expand = function(index) {
      console.log(index);
      $scope.show[index] = !$scope.show[index];
    }
    $scope.showContactInformation = false;
    $scope.displayContactInformation = function(data) {
      $scope.displayContactData = data;
      $scope.showContactInformation = !($scope.showContactInformation);
    }

    $scope.displayContactInformationLocation = function(event) {
        $scope.contactStyle = {
            left: event.clientX,
            top: event.clientY
        }
    }

}])

.controller('newTransactionModalController', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance){
    $scope.submit = function() {
        if ($scope.data) {
            console.log($scope.data);
            var payload = $scope.data;
            io.socket.post('/transactions/newTransaction', payload, function (resData) {
                $scope.cancel();
            });        
        }
    }

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.fields = [ 
        {
            key: 'firstName',
            className: 'col-xs-6',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'First Name',
                placeholder: 'Enter first name',
                required: true
            }
        },
        {
            key: 'lastName',
            className: 'col-xs-6',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Last Name',
                placeholder: 'Enter last name',
                required: true
            }
        },
        {
            key: 'uin',
            className: 'col-xs-6',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'UIN',
                placeholder: 'Enter UIN',
                required: true
            },
            validators: {
                // Custom validator to check whether the driver's license
                // number that the user enters is valid or not
                uinTest: function($viewValue, $modelValue, scope) {
                    var value = $modelValue || $viewValue;
                    if(value) {
                        if (value.length == 9) {
                                return (/^\d+$/.test(value));
                        }
                        else {
                            return false;
                        }
                    }
               }
           }
        },
        {
            key: 'phone',
            className: 'col-xs-6',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Phone',
                placeholder: 'Enter phone number',
                required: true
            },
            validators: {
                // Custom validator to check whether the driver's license
                // number that the user enters is valid or not
                phoneText: function($viewValue, $modelValue, scope) {
                    var value = $modelValue || $viewValue;
                    if(value) {
                        if (value.length == 10) {
                                return (/^\d+$/.test(value));
                        }
                        else {
                            return false;
                        }
                    }
               }
           }
        },
        {
            key: 'email',
            className: 'col-xs-12',
            type: 'input',
            templateOptions: {
                type: 'email',
                label: 'Email',
                placeholder: 'Enter email',
                required: true
            }
        },
        {
            key: 'endDate',
            className: 'col-xs-12',
            type: 'datetimepicker',
            templateOptions: {
                // type: 'text',
                label: 'Return Time',

                placeholder: 'Enter when these items will be returned',
                required: true
            }
        },
        {
            key: 'checkedOutBy',
            className: 'col-xs-12',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Checked Out By',
                placeholder: 'Enter name of who checked this order out',
                required: true
            }
        }
    ]
}]);  