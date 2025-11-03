import { AlertProps } from "@patternfly/react-core";
import { addAlertInternal } from "./Global/alerts-slice";
import store from "./store";

export const addAlert = (
  name: string,
  title: React.ReactNode,
  variant: AlertProps["variant"]
) => {
  store.dispatch(addAlertInternal({ name, title, variant }));
};
