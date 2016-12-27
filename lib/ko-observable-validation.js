ko.validateObservable = function (initialObsOrValue, validationFunction) {
    var obs;
    if (ko.isObservable(initialObsOrValue)) {
        obs = initialObsOrValue;
    }
    else {
        obs = ko.observable(initialObsOrValue);
    }
    Object.defineProperty(obs, "validationFunction", {
        get: function () {
            return validationFunction;
        }
    });
    obs.validationMessages = ko.observableArray();
    function clearValidationMessages() {
        obs.validationMessages([]);
    }
    function setValidationMessages(messages) {
        obs.validationMessages(messages);
    }
    obs.forceStateValid = clearValidationMessages;
    var manualTrigger = ko.observable().extend({ notify: "always" });
    obs.revalidate = function () {
        manualTrigger(manualTrigger());
    };
    var manualTriggerFirstFireSub = manualTrigger.subscribe(function () {
        ensureActivatedComputedValidaate();
        manualTriggerFirstFireSub.dispose();
    });
    obs.subscribe(function () {
        if (!computedValidateActivated) {
            ensureActivatedComputedValidaate();
        }
        else {
            obs.revalidate();
        }
    });
    var computedValidateActivated = false;
    function ensureActivatedComputedValidaate() {
        if (computedValidateActivated) {
            return;
        }
        ko.computed(function () {
            manualTrigger();
            clearValidationMessages();
            var val = obs.peek();
            var newValidationMessages = validationFunction(val) || [];
            setValidationMessages(newValidationMessages);
        });
        computedValidateActivated = true;
    }
    return obs;
};
//# sourceMappingURL=ko-observable-validation.js.map