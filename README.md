# ko-observable-validation

## What this is
ko-observable-validation is a very small library for knockout.js which provides validation hook mixin for observables. 
It is built on two simple and similar premises:
- Views should be dumb (according Robert Cecil Martin).  
- Validation is part of business logic, as such it belongs in the Model \ ViewModel, newer in the View.

That is, your VM valdiation should be testable without any HTML.

## What this does
You get a single extension function for your `ko` object, `validateObservable`, which accepts an observable
and validation function, extends the obsevable in place with `validationMessages` observable array and hooks up the validation 
function as computed. As a result, changes to the value of the extended observable or observables used in validation
function will retrigger validation.

Inside of validation function you are free to use your own code for validation or laverage one of many agnostic validation libraries for JS out there.

```javascript
 var threshold = ko.observable(10);

 var subj = ko.validateObservable(ko.observable(1), function (val) {
            //value convertion is handled by ko bindings and extenders used in views,
            //but validation is only handled here
            if (typeof val !== 'number') {
                return ["Number is required"];
            }
            
            if (val >= threshold()) {
                return ["Value must be lower than " + threshold()];
            }

            //more validation with generic reusable functions

            return [];
        });
        
        
        subj(8);
        console.log(subj.validationMessages().length); //0

        threshold(5);
        console.log(subj.validationMessages()[0]); //Value must be lower than 5

        subj(undefined);
        console.log(subj.validationMessages()[0]); //Number is required

        subj(2);
        console.log(subj.validationMessages().length); //0
```  

After initial extension, observable is automatically considered valid, and the first validation is triggered only after its value changes, or you manually trigger it with `.revalidate()`. After it is triggered first time for whatever reason, validation function is now wrapped in computed. You also have ability to set valid state manually.

```javascript
 var threshold = ko.observable(5);

 var subj = ko.validateObservable(100, function (val) {  
 // you can pass in a non-observable value, it will be wrapped in observable
            if (typeof val !== 'number') {
                return ["Number is required"];
            }
            
            if (val >= threshold()) {
                return ["Value must be lower than " + threshold()];
            }

            return [];
        });
        
        console.log(subj.validationMessages().length); //0, despite threshold being exceeded

        subj.revalidate();
        console.log(subj.validationMessages()[0]); //Value must be lower than 5

        threshold(120);
        console.log(subj.validationMessages().length); //0, revalidated, as the validation functiion was wrapped in computed after first execution

        threshold(5);
        console.log(subj.validationMessages()[0]); //Invalid again

        subj.forceStateValid();
        console.log(subj.validationMessages().length); //0, manually set valid
``` 

## How to use this
Mainly we use it as follows: 
1. `html input element gets the value` value is a string; input may have a widget like dropdown list; 
2. `value converter extender pases string to desired data type` it adds validation messages if value is not parsable; does not handle actuall validation;
3. `value is written into vm observable` at this point, validation function evaluates it an produces validation messages if there are problems; 

View:
```html
    <input type="number" data-bind="value: foo.extend({integerInput:'Please enter integer'})">
    <div data-bind="foreach: foo.validationMessages">
        <div data-bind="text: $data">
    </div>
```

Value converter extenders are not part of this library, but they typically look like this:
```javascript
// a typical knockout observable extender, as given here http://knockoutjs.com/documentation/extenders.html
ko.extenders.integerInput = function (target, option) {
    target.validationMessages = target.validationMessages || ko.observableArray();

    var result = ko.pureComputed({
        read: target,
        write: function(newValue){
            if(newValue.trim() === ""){
                target(null);
                return;
            }

            var intRegex = /^\d+$/;

            if(newValue.match(intRegex) == false){
                target.validationMessages(option || "Only integer allowed");
                return;
            }

            newValue = parseInt(newValue);

            if(target.revalidate && target() === newValue){
                target.revalidate();
                return;
            }
            target(newValue);

        }
    }).extend({notify: 'always'});

    result.validationMessages = target.validationMessages;

    // return new computed
    return result;
}
```

VM:
```javascript
    var vm = {};

    vm.foo =  ko.validateObservable(100, function (val) {  
            if (typeof val !== 'number') {
                return ["Number is required"];
            }
            
            if (val >= 5) {
                return ["Value must be lower than 5"];
            }

            return [];
        });
```

## Dev info
Developed in TypeScript (if you are new to TS - don't worry, just add `lib\ko-obsevable-validation.js` to your project).
Tested with knockout 3.4.1 against evergreen browsers (latest Chrome, Edge, FireFox) and IE11.  