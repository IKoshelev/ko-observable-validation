/// <reference path="../typings/index.d.ts" />

type ValidationFunction<T> 
        = ( val:T)=>string[];

interface ValidatedObservable<T> extends KnockoutObservable<T>{
    readonly validationFunction: ValidationFunction<T>;
    revalidate(): void;
    forceStateValid():void;
    validationMessages: KnockoutObservableArray<string>;
}

interface ValidationMixin{
    <T>(vmObs: KnockoutObservable<T> | T, validate: ValidationFunction<T>):  ValidatedObservable<T>
}
                

interface KnockoutStatic{
    validateObservable:ValidationMixin
}

ko.validateObservable  = <ValidationMixin> function<T>(initialObsOrValue: KnockoutObservable<T> | T, 
                validationFunction: ValidationFunction<T>): ValidatedObservable<T> {

    var obs : ValidatedObservable<T>;
    
    if(ko.isObservable(initialObsOrValue)){
        obs = <ValidatedObservable<T>>initialObsOrValue;
    } else {
        obs = <ValidatedObservable<T>>ko.observable(initialObsOrValue);
    }
    

    Object.defineProperty(obs,"validationFunction", {
        get: function(){
            return validationFunction;
        }
    })

    obs.validationMessages = ko.observableArray<string>();

    function clearValidationMessages(){
        obs.validationMessages([]);
    }

    function setValidationMessages(messages: string[]){
        obs.validationMessages(messages);
    }

    obs.forceStateValid = clearValidationMessages;

    var manualTrigger  = ko.observable().extend({notify:"always"});

    obs.revalidate = function(){
        manualTrigger(manualTrigger());
    }

    var manualTriggerFirstFireSub =  manualTrigger.subscribe(() => {
        ensureActivatedComputedValidaate();
        manualTriggerFirstFireSub.dispose();
    });

    obs.subscribe(() => {
        if(!computedValidateActivated){
            ensureActivatedComputedValidaate();
        } else {
            obs.revalidate();
        }
    });

    var computedValidateActivated = false;
    function ensureActivatedComputedValidaate(){
        if(computedValidateActivated){
            return;
        }

        ko.computed(function(){
            manualTrigger(); // capture dependency
            clearValidationMessages();               
            var val = obs.peek();
            var newValidationMessages = validationFunction(val) || [];
            setValidationMessages(newValidationMessages);
        })

        computedValidateActivated = true;
    }

    return obs;
}