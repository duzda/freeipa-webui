import React, { useEffect, useState } from "react";
// PatternFly
import {
  Button,
  HelperText,
  HelperTextItem,
  TextArea,
  TextInput,
  ValidatedOptions,
} from "@patternfly/react-core";
// Layouts
import SecondaryButton from "../layouts/SecondaryButton";
import ModalWithFormLayout from "../layouts/ModalWithFormLayout";
// Data types
import { HostGroup } from "../../utils/datatypes/globalDataTypes";
// Modals
import ErrorModal from "./ErrorModal";
// Redux
import { useAppDispatch } from "../../store/hooks";
import { addGroup } from "../../store/Identity/hostGroups-slice";
// Errors
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { SerializedError } from "@reduxjs/toolkit";
// Hooks
import useAlerts from "../../hooks/useAlerts";
import { FindRPCResponse } from "../../services/rpc";
import {
  GroupAddPayload,
  useAddHostGroupMutation,
} from "../../services/rpcHostGroups";
interface PropsToAddGroup {
  show: boolean;
  handleModalToggle: () => void;
  onOpenAddModal?: () => void;
  onCloseAddModal?: () => void;
  onRefresh?: () => void;
}

const AddHostGroup = (props: PropsToAddGroup) => {
  // Set dispatch (Redux)
  const dispatch = useAppDispatch();

  // Alerts to show in the UI
  const alerts = useAlerts();

  const [executeGroupAddCommand] = useAddHostGroupMutation();

  // Set host names list
  const [addSpinning, setAddBtnSpinning] = React.useState<boolean>(false);
  const [addAgainSpinning, setAddAgainBtnSpinning] =
    React.useState<boolean>(false);
  const [groupName, setGroupName] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Add button is disabled until the user fills the required fields
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    if (groupName === "") {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [groupName]);

  // List of fields
  const fields = [
    {
      id: "modal-form-hostgroup-name",
      name: "Group name",
      pfComponent: (
        <>
          <TextInput
            data-cy="modal-textbox-hostgroup-name"
            type="text"
            id="modal-form-hostgroup-name"
            name="modal-form-hostgroup-name"
            value={groupName}
            onChange={(_event, value: string) => setGroupName(value)}
            validated={
              groupName === ""
                ? ValidatedOptions.error
                : ValidatedOptions.default
            }
          />
          <HelperText>
            {groupName === "" && (
              <HelperTextItem>Required value</HelperTextItem>
            )}
          </HelperText>
        </>
      ),
    },
    {
      id: "modal-form-hostgroup-desc",
      name: "Description",
      pfComponent: (
        <TextArea
          data-cy="modal-textbox-hostgroup-description"
          id="modal-form-hostgroup-desc"
          name="modal-form-hostgroup-desc"
          value={description}
          onChange={(_event, value) => setDescription(value)}
          aria-label="Host group description"
          autoResize
        />
      ),
    },
  ];

  // Helper method to clean the fields
  const cleanAllFields = () => {
    setGroupName("");
    setDescription("");
    setAddBtnSpinning(false);
    setAddAgainBtnSpinning(false);
  };

  // Clean fields and close modal (To prevent data persistence when reopen modal)
  const cleanAndCloseModal = () => {
    cleanAllFields();
    props.handleModalToggle();
  };

  // Define status flags to determine user added successfully or error
  let isAdditionSuccess = true;

  // Track which button has been clicked ('onAddUser' or 'onAddAndAddAnother')
  // to better handle the 'retry' function and its behavior
  let onAddGroupClicked = true;

  // Add host data
  const addGroupData = async () => {
    const newGroupPayload = {
      groupName: groupName,
      description: description,
    } as GroupAddPayload;

    // Add host via API call
    await executeGroupAddCommand(newGroupPayload).then((group) => {
      if ("data" in group) {
        const data = group.data as FindRPCResponse;
        const error = data.error as FetchBaseQueryError | SerializedError;
        const result = data.result;

        if (error) {
          // Set status flag: error
          isAdditionSuccess = false;
          // Handle error
          handleAPIError(error);
        } else {
          // Set alert: success
          alerts.addAlert(
            "add-hostgroup-success",
            "New host group added",
            "success"
          );

          // Dispatch host data to redux
          const newGroup = result.result as unknown as HostGroup;
          dispatch(addGroup(newGroup));
          // Set status flag: success
          isAdditionSuccess = true;
          // Refresh data
          if (props.onRefresh !== undefined) {
            props.onRefresh();
          }
        }
      }
    });
  };

  const addAndAddAnotherHandler = () => {
    onAddGroupClicked = false;
    setAddAgainBtnSpinning(true);
    addGroupData().then(() => {
      if (isAdditionSuccess) {
        // Do not close the modal, but clean fields & reset validations
        cleanAllFields();
      } else {
        // Close the modal without cleaning fields
        if (props.onCloseAddModal !== undefined) {
          props.onCloseAddModal();
        }
        setAddAgainBtnSpinning(false);
      }
    });
  };

  const addGroupHandler = () => {
    onAddGroupClicked = true;
    setAddBtnSpinning(true);
    addGroupData().then(() => {
      if (!isAdditionSuccess) {
        // Close the modal without cleaning fields
        if (props.onCloseAddModal !== undefined) {
          props.onCloseAddModal();
        }
        setAddBtnSpinning(false);
      } else {
        // Clean data and close modal
        cleanAndCloseModal();
      }
    });
  };

  // Error handling
  const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const closeAndCleanErrorParameters = () => {
    setIsModalErrorOpen(false);
    setErrorTitle("");
    setErrorMessage("");
  };

  const onCloseErrorModal = () => {
    closeAndCleanErrorParameters();
    // Show Add modal
    if (props.onOpenAddModal !== undefined) {
      props.onOpenAddModal();
    }
  };

  const onRetry = () => {
    // Keep the add modal closed until the operation is done...
    if (props.onCloseAddModal !== undefined) {
      props.onCloseAddModal();
    }

    // Close the error modal
    closeAndCleanErrorParameters();

    // Repeats the same previous operation
    if (onAddGroupClicked) {
      addGroupHandler();
    } else {
      addAndAddAnotherHandler();
    }
  };

  const errorModalActions = [
    <SecondaryButton
      dataCy="modal-button-retry"
      key="retry"
      onClickHandler={onRetry}
    >
      Retry
    </SecondaryButton>,
    <Button
      data-cy="modal-button-cancel"
      key="cancel"
      variant="link"
      onClick={onCloseErrorModal}
    >
      Cancel
    </Button>,
  ];

  const handleAPIError = (error: FetchBaseQueryError | SerializedError) => {
    if ("code" in error) {
      setErrorTitle("IPA error " + error.code + ": " + error.name);
      if (error.message !== undefined) {
        setErrorMessage(error.message);
      }
    }
    setIsModalErrorOpen(true);
  };

  // Buttons that will be shown at the end of the form
  const modalActions = [
    <SecondaryButton
      dataCy="modal-button-add"
      key="add-new-hostgroup"
      name="add"
      isDisabled={buttonDisabled || addAgainSpinning || addSpinning}
      onClickHandler={addGroupHandler}
      form="modal-form-add-hostgroup"
      spinnerAriaValueText="Adding"
      spinnerAriaLabel="Adding"
      isLoading={addSpinning}
    >
      {addSpinning ? "Adding" : "Add"}
    </SecondaryButton>,
    <SecondaryButton
      dataCy="modal-button-add-and-add-another"
      key="add-and-add-another-new-group"
      name="add_and_add_another"
      isDisabled={buttonDisabled || addAgainSpinning || addSpinning}
      onClickHandler={addAndAddAnotherHandler}
      form="modal-form-add-another-hostgroup"
      spinnerAriaValueText="Adding again"
      spinnerAriaLabel="Adding again"
      isLoading={addAgainSpinning}
    >
      {addAgainSpinning ? "Adding" : "Add and add another"}
    </SecondaryButton>,
    <Button
      data-cy="modal-button-cancel"
      key="cancel-new-group"
      variant="link"
      onClick={cleanAndCloseModal}
    >
      Cancel
    </Button>,
  ];

  // Render component
  return (
    <>
      <alerts.ManagedAlerts />
      <ModalWithFormLayout
        dataCy="add-hostgroup-modal"
        variantType="small"
        modalPosition="top"
        offPosition="76px"
        title="Add host group"
        formId="modal-form-add-hostgroup"
        fields={fields}
        show={props.show}
        onClose={cleanAndCloseModal}
        actions={modalActions}
      />
      {isModalErrorOpen && (
        <ErrorModal
          dataCy="add-hostgroup-modal-error"
          title={errorTitle}
          isOpen={isModalErrorOpen}
          onClose={onCloseErrorModal}
          actions={errorModalActions}
          errorMessage={errorMessage}
        />
      )}
    </>
  );
};

export default AddHostGroup;
