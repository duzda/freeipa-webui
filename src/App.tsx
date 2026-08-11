import React from "react";
// PatternFly
import "@patternfly/react-core/dist/styles/base.css";
// Layouts
import { AppLayout } from "./AppLayout";
import DataSpinner from "./components/layouts/DataSpinner";
// Navigation
import { AppRoutes } from "./navigation/AppRoutes";
// RPC client
import { Command, useBatchCommandQuery } from "./services/rpc";
// Redux
import { useAppDispatch, useAppSelector } from "src/store/hooks";
import {
  updateIpaServerConfiguration,
  updateLoggedUserInfo,
  updateEnvironment,
  updateDnsIsEnabled,
  updateTrustConfiguration,
  updateDomainLevel,
  updateCaIsEnabled,
  updateVaultConfiguration,
} from "src/store/Global/global-slice";
import { setLoggedUser, setLoggedOut } from "./store/Global/auth-slice";
// Alerts
import ManagedAlerts from "./components/ManagedAlerts";

const App: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const loggedUser = useAppSelector((state) => state.auth.loggedUser);

  // [API Call] Get initial data
  const payloadDataBatch: Command[] = [];
  const methods = [
    "config_show",
    "whoami",
    "env",
    "dns_is_enabled",
    "trustconfig_show",
    "domainlevel_get",
    "ca_is_enabled",
    "vaultconfig_show",
  ];

  methods.map((method) => {
    const payloadItem = {
      method: method,
      params: [[], {}],
    };
    payloadDataBatch.push(payloadItem);
  });

  const {
    data: initialBatchResponse,
    isFetching: isInitialBatchFetching,
    // TODO: Manage error handling correctly
  } = useBatchCommandQuery(payloadDataBatch);

  // Store data in global slice (Redux)
  React.useEffect(() => {
    if (initialBatchResponse === undefined) {
      // Assume that the user is not loaded
      dispatch(setLoggedOut());
    }

    if (initialBatchResponse !== undefined) {
      // 0: IPA server configuration ("config_show")
      const configShowResponse = initialBatchResponse.result.results[0].result;
      dispatch(updateIpaServerConfiguration(configShowResponse));
      // 1: Logged user information ("whoami")
      const whoamiResponse = initialBatchResponse.result.results[1];
      const user = whoamiResponse.arguments.toString();
      dispatch(updateLoggedUserInfo(user));
      // 2: Environment ("env")
      const envResponse = initialBatchResponse.result.results[2].result;
      dispatch(updateEnvironment(envResponse));
      // 3: DNS is enabled ("dns_is_enabled")
      const dnsEnabledResponse: boolean =
        initialBatchResponse.result.results[3].result;
      dispatch(updateDnsIsEnabled(dnsEnabledResponse));
      // 4: Trust configuration ("trustconfig_show")
      const trustConfigResponse = initialBatchResponse.result.results[4].result;
      dispatch(updateTrustConfiguration(trustConfigResponse));
      // 5: Domain level ("domainlevel_get")
      const domainLevelResponse = initialBatchResponse.result.results[5].result;
      dispatch(updateDomainLevel(domainLevelResponse));
      // 6: CA is enabled ("ca_is_enabled")
      const caEnabledResponse = initialBatchResponse.result.results[6].result;
      dispatch(updateCaIsEnabled(caEnabledResponse));
      // 7: Vault configuration ("vaultconfig_show")
      const vaultConfig = initialBatchResponse.result.results[7].result;
      dispatch(updateVaultConfiguration(vaultConfig));

      // Set the login status if user found in the whoami response
      if (user) {
        // [Redux] Update the login status
        dispatch(setLoggedUser(user));
      } else {
        dispatch(setLoggedOut());
      }
    }
  }, [initialBatchResponse]);

  if (isInitialBatchFetching) {
    return <DataSpinner />;
  }

  return (
    <>
      <ManagedAlerts />
      {loggedUser !== null ? (
        <AppLayout loggedInUser={loggedUser}>
          <AppRoutes />
        </AppLayout>
      ) : (
        <AppRoutes />
      )}
    </>
  );
};

export default App;
