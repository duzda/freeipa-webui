import React from "react";
// PatternFly
import { Button, Flex, FlexItem } from "@patternfly/react-core";
// Components
import TitleLayout from "src/components/layouts/TitleLayout";
import TextLayout from "src/components/layouts/TextLayout";
// Modals
import InformationModalLayout from "src/components/layouts/InformationModalLayout";
// Data types
import { CertificateData } from "src/components/Form/IpaCertificates";
// Utils
import { parseDn } from "src/utils/utils";

interface PropsToCertificatesInfoModal {
  isOpen: boolean;
  onClose: () => void;
  idxSelected: number;
  certificatesList: CertificateData[];
  uid: string;
}

const CertificatesInformationModal = (props: PropsToCertificatesInfoModal) => {
  const [certName, setCertName] = React.useState<string>("");

  React.useEffect(() => {
    const certInfo = props.certificatesList[props.idxSelected].certInfo;
    if (certInfo !== undefined) {
      setCertName(parseDn(certInfo.subject).cn);
    }
  }, [props.certificatesList, props.idxSelected]);

  // Actions
  const infoModalActions = [
    <Button key="close" variant="primary" onClick={props.onClose}>
      Close
    </Button>,
  ];

  const parseKeyValue = (key: string, value: string) => {
    return (
      <Flex>
        <FlexItem>
          <TextLayout>{key}:</TextLayout>
        </FlexItem>
        <FlexItem>
          <TextLayout className="pf-v5-u-ml-md">{value}</TextLayout>
        </FlexItem>
      </Flex>
    );
  };

  const certInfo = props.certificatesList[props.idxSelected].certInfo;
  const infoModalContent = (
    <>
      {certInfo !== undefined && (
        <>
          <TitleLayout
            id={"info-modal-issued-to"}
            headingLevel="h2"
            text={"Issued to"}
          />
          {parseKeyValue("Common name", parseDn(certInfo.subject).cn || "")}
          {parseKeyValue("Organization", parseDn(certInfo.subject).o || "")}
          {parseKeyValue(
            "Organization unit",
            parseDn(certInfo.issuer).ou || ""
          )}
          {parseKeyValue("Serial number", certInfo.serial_number || "")}
          {parseKeyValue(
            "Serial number (hex)",
            certInfo.serial_number_hex || ""
          )}
          <TitleLayout
            id={"info-modal-issued-by"}
            headingLevel="h2"
            text={"Issued by"}
            className="pf-v5-u-mt-sm"
          />
          {parseKeyValue("Common name", parseDn(certInfo.issuer).cn || "")}
          {parseKeyValue("Organization", parseDn(certInfo.issuer).o || "")}
          {parseKeyValue(
            "Organization unit",
            parseDn(certInfo.issuer).ou || ""
          )}
          <TitleLayout
            id={"info-modal-validity"}
            headingLevel="h2"
            text={"Validity"}
            className="pf-v5-u-mt-sm"
          />
          {parseKeyValue("Issued on", certInfo.valid_not_before || "")}
          {parseKeyValue("Expires on", certInfo.valid_not_after || "")}
          <TitleLayout
            id={"info-modal-fingerprints"}
            headingLevel="h2"
            text={"Fingerprints"}
            className="pf-v5-u-mt-sm"
          />
          {parseKeyValue("Expires on", certInfo.sha1_fingerprint || "")}
          {parseKeyValue("Expires on", certInfo.sha256_fingerprint || "")}
        </>
      )}
    </>
  );

  return (
    <InformationModalLayout
      title={"Certificate for " + certName}
      variant="medium"
      actions={infoModalActions}
      isOpen={props.isOpen}
      onClose={props.onClose}
      content={infoModalContent}
    />
  );
};

export default CertificatesInformationModal;
