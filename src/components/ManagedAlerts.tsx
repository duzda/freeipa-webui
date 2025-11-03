import React from "react";
// PatternFly
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";
// Alerts
import {
  AlertInfo,
  removeAlert,
  removeAllAlerts,
} from "src/store/Global/alerts-slice";
import store from "src/store/store";

const ManagedAlerts = () => {
  const [alerts, setAlerts] = React.useState<AlertInfo[]>([]);

  store.subscribe(() => {
    setAlerts(store.getState().alerts);
  });

  const toAlertElements = (alerts: AlertInfo[]): JSX.Element[] => {
    return alerts.map((alert) => (
      <Alert
        key={alert.name}
        data-cy={alert.name}
        variant={alert.variant}
        title={alert.title}
        role="alert"
        timeout
        isLiveRegion
        onTimeout={() => store.dispatch(removeAlert({ name: alert.name }))}
        actionClose={
          <AlertActionCloseButton
            data-cy={"alert-button-close"}
            variantLabel={`${alert.variant} alert`}
            onClose={() => store.dispatch(removeAlert({ name: alert.name }))}
          />
        }
      />
    ));
  };

  return (
    <AlertGroup
      isToast
      isLiveRegion
      onOverflowClick={() => store.dispatch(removeAllAlerts())}
    >
      {toAlertElements(alerts)}
    </AlertGroup>
  );
};

export default ManagedAlerts;
