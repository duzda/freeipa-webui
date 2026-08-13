import React from "react";
// PatternFly
import "@patternfly/react-core/dist/styles/base.css";
// Layouts
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
import { setLoggedIn, setLoggedOut } from "./store/Global/auth-slice";
// Alerts
import ManagedAlerts from "./components/ManagedAlerts";

const BATCH_COMMANDS = [
  "config_show",
  "whoami",
  "env",
  "dns_is_enabled",
  "trustconfig_show",
  "domainlevel_get",
  "ca_is_enabled",
  "vaultconfig_show",
];

const BATCH_COMMANDS_PAYLOAD: Command[] = BATCH_COMMANDS.map((method) => {
  return {
    method: method,
    params: [[], {}],
  };
});

const App: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const loggedIn = useAppSelector((state) => state.auth.loggedIn);

  React.useEffect(() => {
    // We need to refetch data on user change
    if (!isInitialBatchLoading && loggedIn) {
      refetch();
    }
  }, [loggedIn]);

  const {
    data: initialBatchResponse,
    isFetching: isInitialBatchFetching,
    isLoading: isInitialBatchLoading,
    refetch,
    // TODO: Manage error handling correctly
  } = useBatchCommandQuery(BATCH_COMMANDS_PAYLOAD);

  // Store data in global slice (Redux)
  React.useEffect(() => {
    if (initialBatchResponse === undefined) {
      return;
    }

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
      dispatch(setLoggedIn());
    } else {
      dispatch(setLoggedOut());
    }
  }, [initialBatchResponse]);

  if (isInitialBatchFetching) {
    return <DataSpinner />;
  }

  return (
    <>
      <ManagedAlerts />
      <AppRoutes />
    </>
  );
};

export default App;
