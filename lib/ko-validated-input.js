(function () {
    var validatedInputFactory = function (vmObs, validate) {
        if (typeof validate === 'undefined') {
            validate = function (vmObs, viewObs, currentCycleLog) {
                var val = viewObs();
                vmObs(val);
            };
        }
        var viewObs = ko.observable();
        viewObs.validationFunction = validate;
        var manualRevalidaionTrigger = ko.observable().extend({ notify: 'always' });
        viewObs.revalidate = function () { };
        viewObs.validationMessages = ko.observableArray();
        var currentCycleLog = [];
        var cycleStopTimeoutHanlde;
        function onCycleEventStarted(currentCycleLog) {
            if (currentCycleLog.length === 0) {
                viewObs.validationMessages([]);
            }
            if (cycleStopTimeoutHanlde) {
                return;
            }
            cycleStopTimeoutHanlde = setTimeout(function () {
                cycleStopTimeoutHanlde = undefined;
                currentCycleLog = [];
            });
        }
        function onNewCycleStarted() {
            currentCycleLog = [];
        }
        function isPrecedingLogEventsASequenceOf(currentCycleLog, precedingLast, prerecdingBeforeLast) {
            var len = currentCycleLog.length;
            if (len < 2) {
                return false;
            }
            return currentCycleLog[len - 1] == precedingLast
                && currentCycleLog[len - 2] == prerecdingBeforeLast;
        }
        vmObs.subscribe(function () {
            function isLasttEventvalidateStart() {
                return currentCycleLog.length > 0 && currentCycleLog[currentCycleLog.length - 1] == 'validateStart';
            }
            if (isLasttEventvalidateStart() == false) {
                onNewCycleStarted();
            }
            onCycleEventStarted(currentCycleLog);
            currentCycleLog.push('vmObservableSet');
        });
        viewObs.subscribe(function () {
            function isLasttEventFormatStart() {
                return currentCycleLog.length > 0 && currentCycleLog[currentCycleLog.length - 1] == 'formatStart';
            }
            if (isLasttEventFormatStart() == false) {
                onNewCycleStarted();
            }
            onCycleEventStarted(currentCycleLog);
            currentCycleLog.push('viewObservableSet');
            activatevalidateSubscription();
        });
        var revalidationInitialHandle = manualRevalidaionTrigger.subscribe(function () {
            revalidationInitialHandle.dispose();
            activatevalidateSubscription();
        });
        var isvalidateSubscriptionActivated = false;
        function activatevalidateSubscription() {
            if (isvalidateSubscriptionActivated) {
                return;
            }
            ko.computed(function () {
                manualRevalidaionTrigger();
                onCycleEventStarted(currentCycleLog);
                currentCycleLog.push('validateStart');
                viewObs.validationFunction(vmObs, viewObs, currentCycleLog);
                currentCycleLog.push('validateEnd');
            });
            isvalidateSubscriptionActivated = true;
        }
        return viewObs;
    };
    ko.validatedInput = validatedInputFactory;
})();
//# sourceMappingURL=ko-validated-input.js.map