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
