angular.module('app', ['ui.bootstrap','formly', 'formlyBootstrap', 'ui.bootstrap.datetimepicker', 'ui.select'  ])

.run(function(formlyConfig) {
    formlyConfig.extras.removeChromeAutoComplete = true;
    formlyConfig.setType({
      name: 'async-ui-select',
      extends: 'select',
      templateUrl: 'async-ui-select-type.html'
    });

    formlyConfig.setType({
      name: 'test',
      extends: 'select',
      templateUrl: 'test.html'
    });

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

    $scope.currentDate = new Date().getTime();

    io.socket.on('newTransaction', function(event) {
        $scope.data = event;

        if ($scope.show == undefined) {
            var expanded = $scope.show;
            $scope.show = [true];
            for (var i=0; i<expanded.length; i++) {
                $scope.show.push(expanded[i]);
            }
        }
        if ($scope.data.length != $scope.show) {
            var expanded = $scope.show;
            $scope.show = [true];
            for (var i=0; i<expanded.length; i++) {
                $scope.show.push(expanded[i]);
            }
        }

        $scope.data = $scope.formatData($scope.data);

        $scope.$apply();
    });

    $scope.showReturnedTest = true;
    $scope.showReturned = function() {
        $scope.showReturnedTest = !$scope.showReturnedTest;
    }

    $scope.formatData = function(data) {
        for (var i=0; i<data.length; i++) {
            if (data[i].itemsCheckedOut)
                data[i].checkedOut = JSON.parse(data[i].itemsCheckedOut);
            if (data[i].itemsCheckedIn)
                data[i].checkedIn = JSON.parse(data[i].itemsCheckedIn);
            if (data[i].endDate)
                data[i].endDate = parseInt(data[i].endDate);
            data[i].returned = (data[i].checkedOut.length == 0);
            $scope.$apply();
        }
        return data;
    }

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
            $scope.data = $scope.formatData($scope.data);
        })
    }
    
    $scope.getAllTransactions();

    $scope.show = [];

    $scope.expand = function(index) {
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

    $scope.checkIn = function(transaction) {
      console.log(transaction);
      var modalInstance = $uibModal.open({
            templateUrl: 'checkInModal.html',
            controller: 'checkInModalController',
            size: 'lg',
            resolve: { 
                transaction: function () {
                    return transaction;
                }}
        });
    }

}])

.controller('checkInModalController', ['$scope', '$uibModalInstance', 'transaction', function($scope, $uibModalInstance, transaction){
    $scope.data = {};
    $scope.checked = false;
    $scope.hideButtons = true;

    $scope.checkAll = function() {
        if ($scope.checked) {
            $scope.uncheckAll();
        }
        else {
            $scope.checked = true;
            for (var i=0; i<$scope.fields.length; i++) {
                $scope.data[$scope.fields[i].key] = true;
            }
        }
    }

    $scope.uncheckAll = function() {
        $scope.checked = false;
        for (var i=0; i<$scope.fields.length; i++) {
            $scope.data[$scope.fields[i].key] = false;
        }
    }

    $scope.next = function() {
        console.log(transaction);
        $scope.hideButtons = false;
        var newFields = [];
        var itemsCheckedOut = JSON.parse(transaction.itemsCheckedOut);
        console.log(itemsCheckedOut);
        for (var i=0; i<itemsCheckedOut.length; i++) {
            newFields.push( 
                {
                    key: itemsCheckedOut[i],
                    className: 'col-xs-12',
                    type: 'checkbox',
                    templateOptions: {
                        label: itemsCheckedOut[i],
                    },
                }
            )
        }
        $scope.fields = newFields;
        console.log($scope.fields);
    
    }

    $scope.submit = function() {
        console.log($scope.data);
        var payload = transaction;
        var itemsCheckedIn = [];
        for (key in $scope.data) {
            var item = {};
            if (key != 'name') {
                if ($scope.data[key]) {
                    item.item = key;
                    item.checkedIn = $scope.data.name;
                    item.timestamp = new Date();
                    itemsCheckedIn.push(item);
                    payload.checkedOut.splice(payload.checkedOut.indexOf(key),1);
                }
            }
        }

        var pastCheckIn = JSON.parse(payload.itemsCheckedIn);
        for (var i=0; i<pastCheckIn.length; i++) {
            itemsCheckedIn.push(pastCheckIn[i]);
        }
        console.log(itemsCheckedIn);
        payload.updatedData = {itemsCheckedIn: JSON.stringify(itemsCheckedIn), itemsCheckedOut:JSON.stringify(payload.checkedOut)} ;
        console.log(payload);
        io.socket.post('/transactions/updateTransaction', payload, function (resData) {
          
        });  
          $scope.cancel();
    }

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.hideButtons = true;

    $scope.fields = [ 
        {
            key: 'name',
            className: 'col-xs-12',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Checked In By',
                placeholder: 'Enter first and last name',
                required: true
            }
        }
    ]
}])

.controller('newTransactionModalController', ['$scope', '$uibModalInstance', function($scope, $q, $uibModalInstance){
    $scope.submit = function() {
        if ($scope.data) {
            var payload = $scope.data;
            var items = [];
            for (var i=0; i<$scope.count; i++) {
                if ($scope.data['item' + i])
                    items.push($scope.data['item' + i]);
            }
            payload.itemsCheckedOut = JSON.stringify(items);
            payload.itemsCheckedIn = JSON.stringify([]);

            payload.endDate = payload.endDate.getTime();
            io.socket.post('/transactions/newTransaction', payload, function (resData) {
                // var emailPayload = {};
                // emailPayload.fullName = payload.name;
                // emailPayload.endDate = Date(payload.endDate);
                // emailPayload.items = items.join(',');

                // io.socket.post('/email/sendEmail', emailPayload, function (data) {
                //   console.log(data);
                // });

                $scope.cancel();
            });        
        }
    }

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.count = 0;


    $scope.addField = function(count) {
        $scope.$watch(('data.item' + $scope.count), function(newValue, oldValue) {
            if (!oldValue && newValue) {
                $scope.addNewItemField();
                $scope.addField($scope.count);
            }
        });
    }
    
    $scope.addField();

    $scope.addNewItemField = function() {
        $scope.count++;
        var index = 7 + $scope.count;

        $scope.fields[index] = {
            key: ('item' + $scope.count),
            className: 'col-xs-12',
            type: 'input',
            templateOptions: {
                type: 'text',
                // label: 'Item',
                placeholder: 'Enter item',
            }
        };
    }
    $scope.data = {};
    $scope.data.endDate = new Date();

     $scope.refreshAddresses = function(address, field) {
      var promise;
      if (!address) {
        promise = $q.when({data: {results: []}});
      } else {
        var params = {address: address, sensor: false};
        var endpoint = '//maps.googleapis.com/maps/api/geocode/json';
        promise = $http.get(endpoint, {params: params});
      }
      return promise.then(function(response) {
        field.templateOptions.options = response.data.results;
      });
    }

    $scope.formatData = function(data) {
        for (var i=0; i<data.length; i++) {
            if (data[i].itemsCheckedOut)
                data[i].checkedOut = JSON.parse(data[i].itemsCheckedOut);
            if (data[i].itemsCheckedIn)
                data[i].checkedIn = JSON.parse(data[i].itemsCheckedIn);
            if (data[i].endDate)
                data[i].endDate = parseInt(data[i].endDate);
            data[i].returned = (data[i].checkedOut.length == 0);
            $scope.$apply();
        }
        return data;
    }

    $scope.getAllOptions = function() {
    //     io.socket.get('/transactions/getAllTransactions', function (data) {
    //         console.log(data);
    //          var users = $scope.formatData(data);
    //          console.log(users);
    //     })

    //     // for (var)
    }

    $scope.getAllOptions();

    $scope.allOptions = []

    $scope.currentOptions = [];

    $scope.fields = [ 
        {
            key: 'name',
            type: 'test',
            templateOptions: {
                label: 'First and Last Name',
                placeholder: 'test',
                autofill: function(name) {
                    console.log(name);
                },
                fields: [ 
                    {
                        key: 'search',
                        type: 'input',
                        watcher: {
                            listener: function(field, newValue, oldValue, scope, stopWatching) {
                                if(newValue) {
                                    console.log(newValue);
                                    $scope.fields[0].templateOptions.fields[1].templateOptions.options = [];
                                    for (var i=0; i<$scope.allOptions.length; i++) {
                                        if ($scope.allOptions[i].name.includes(newValue)) {
                                            $scope.fields[0].templateOptions.fields[1].templateOptions.options.push($scope.allOptions[i]);
                                        }
                                    }
                                    console.log($scope.fields[0].templateOptions.fields[1].templateOptions.options);
                                }
                            }
                        }   
                    },
                    {
                        key: 'test',
                        type: 'select',
                        templateOptions: {
                            options: [],
                        },
                        hideExpression: true
                    }
                ]
        }
    },
        // },
        // {
        //     key: 'lastName',
        //     className: 'col-xs-6',
        //     type: 'input',
        //     templateOptions: {
        //         type: 'text',
        //         label: 'Last Name',
        //         placeholder: 'Enter last name',
        //         required: true
        //     }
        // },
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
                    else {
                      return false;
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
                    else {
                      return false;
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
                placeholder: 'Enter first and last name',
                required: true
            }
        },
        {
            key: 'item0',
            className: 'col-xs-12',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Item(s)',
                placeholder: 'Enter item',
                required: true
            },
        }
    ]

}]);  