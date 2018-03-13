'use strict';
var addressFieldDrtv = function($compile) {
    return {
        restrict: "E",
        link: function(scope, element, attrs) {
            var varName = attrs.varName;
            var varArr = varName.split('.');
            var placeholder = attrs.placeholder == undefined ? 'mewtopia.eth or 0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D' : attrs.placeholder ;
            var labelTranslated = attrs.labeltranslated == undefined ? 'SEND_addr' : attrs.labeltranslated;
            var setValue = function(value) {
                var temp = scope;
                for (var i in varArr) {
                    if (i == varArr.length - 1) temp[varArr[i]] = value;
                    else {
                        temp = temp[varArr[i]];
                    }
                }
            }
            scope.addressDrtv = {
                showDerivedAddress: false,
                ensAddressField: globalFuncs.urlGet('to') == null ? "" : globalFuncs.urlGet('to'),
                derivedAddress: '',
                readOnly: false
            }


            scope.phishing = {
              msg: '',
              error: false
            }

            scope.checkIfPhishing = (text) => {
              for(let i = 0; i < Darklist.length; i++) {
                if(text === Darklist[i].address) {
                  scope.phishing.msg = Darklist[i].comment !== '' ? Darklist[i].comment : 'This address has been flagged in our Phishing list. Please make sure you are typing the right address';
                  scope.phishing.error = true;
                  return;
                } else {
                  scope.phishing.msg = '';
                  scope.phishing.error = false;
                }
              }
            };
            element.html(`
              <div class="col-xs-11">
                <input class="form-control" type="text" placeholder="${placeholder}" ng-model="${scope.addressDrtv.ensAddressField}" ng-disabled="${scope.addressDrtv.readOnly}" ng-change="checkIfPhishing(scope.addressDrtv.ensAddressField)" ng-class="${Validator.isValidENSorEtherAddress(varName) ? "is-valid" : "is-invalid"}"/>
                <p class="ens-response" ng-show="${scope.addressDrtv.showDerivedAddress}">
                  <span class="mono ng-binding"> {{addressDrtv.derivedAddress}} </span>
                </p>
                <p class="ens-response" ng-show="${scope.addressDrtv.showDerivedAddress}">
                  <span class="mono ng-binding"> {{addressDrtv.derivedAddress}} </span>
                </p>
              </div>
              <div class="col-xs-1 address-identicon-container">
                <div class="addressIdenticon" title="Address Indenticon" blockie-address=${varName} watch-var=${varName}></div>
              </div>
            `)

            scope.$watch('addressDrtv.ensAddressField', function() {
                var _ens = new ens();
                if (Validator.isValidAddress(scope.addressDrtv.ensAddressField)) {
                    setValue(scope.addressDrtv.ensAddressField);
                    if (!Validator.isChecksumAddress(scope.addressDrtv.ensAddressField)) {
                        scope.notifier.info(globalFuncs.errorMsgs[35]);
                    }
                } else if (Validator.isValidENSAddress(scope.addressDrtv.ensAddressField)) {
                    _ens.getAddress(scope.addressDrtv.ensAddressField, function(data) {
                        if (data.error) uiFuncs.notifier.danger(data.msg);
                        else if (data.data == '0x0000000000000000000000000000000000000000' || data.data == '0x') {
                            setValue('0x0000000000000000000000000000000000000000');
                            scope.addressDrtv.derivedAddress = '0x0000000000000000000000000000000000000000';
                            scope.addressDrtv.showDerivedAddress = true;
                        } else {
                            setValue(data.data);
                            scope.addressDrtv.derivedAddress = ethUtil.toChecksumAddress(data.data);
                            scope.addressDrtv.showDerivedAddress = true;
                        }
                    });
                } else {
                    setValue('');
                    scope.addressDrtv.showDerivedAddress = false;
                }
            });
            $compile(element.contents())(scope);
        }
    };
};
module.exports = addressFieldDrtv;
