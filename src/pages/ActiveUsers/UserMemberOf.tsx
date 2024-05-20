import React, { useState } from "react";
import {
  TabTitleText,
  Page,
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  Badge,
} from "@patternfly/react-core";
// Data types
import { User } from "src/utils/datatypes/globalDataTypes";
// Wrappers
import MemberOfUserGroups from "src/components/MemberOf/MemberOfUserGroups";
import MemberOfNetgroups from "src/components/MemberOf/MemberOfNetgroups";
import MemberOfRoles from "src/components/MemberOf/MemberOfRoles";
import MemberOfHbacRules from "src/components/MemberOf/MemberOfHbacRules";
import MemberOfSudoRules from "src/components/MemberOf/MemberOfSudoRules";
// RPC
import { useGetUserByUidQuery } from "src/services/rpcUsers";
// Utils
import { convertToString } from "src/utils/ipaObjectUtils";

interface PropsToUserMemberOf {
  user: User;
  tab: string;
  from: string;
}

const UserMemberOf = (props: PropsToUserMemberOf) => {
  // User's full data
  const userQuery = useGetUserByUidQuery(convertToString(props.user.uid));

  const userData = userQuery.data || {};

  const [user, setUser] = React.useState<Partial<User>>({});

  React.useEffect(() => {
    if (!userQuery.isFetching && userData) {
      setUser({ ...userData });
    }
  }, [userData, userQuery.isFetching]);

  const onRefreshUserData = () => {
    userQuery.refetch();
  };

  // 'User groups' length to show in tab badge
  const [userGroupsLength, setUserGroupLength] = React.useState(0);

  React.useEffect(() => {
    if (user && user.memberof_group) {
      setUserGroupLength(user.memberof_group.length);
    }
  }, [user]);

  // 'Netgroups' length to show in tab badge
  const [netgroupsLength, setNetgroupsLength] = React.useState(0);

  React.useEffect(() => {
    if (user && user.memberof_netgroup) {
      setNetgroupsLength(user.memberof_netgroup.length);
    }
  }, [user]);

  // 'Roles' length to show in tab badge
  const [rolesLength, setRolesLength] = React.useState(0);

  React.useEffect(() => {
    if (user && user.memberof_role) {
      setRolesLength(user.memberof_role.length);
    }
  }, [user]);

  // 'HBACRules' length to show in tab badge
  const [hbacRulesLength, setHbacRulesLength] = React.useState(0);

  React.useEffect(() => {
    if (user && user.memberof_hbacrule) {
      setHbacRulesLength(user.memberof_hbacrule.length);
    }
  }, [user]);

  // 'Sudo rules' length to show in tab badge
  const [sudoRulesLength, setSudoRulesLength] = React.useState(0);

  React.useEffect(() => {
    if (user && user.memberof_sudorule) {
      setSudoRulesLength(user.memberof_sudorule.length);
    }
  }, [user]);

  // Tab
  const [activeTabKey, setActiveTabKey] = useState(0);

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: number | string
  ) => {
    setActiveTabKey(tabIndex as number);
  };

  // Render 'ActiveUsersIsMemberOf'
  return (
    <Page>
      <PageSection
        variant={PageSectionVariants.light}
        isFilled={false}
        className="pf-v5-u-m-lg"
      >
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          isBox={false}
          mountOnEnter
          unmountOnExit
        >
          <Tab
            eventKey={0}
            name="memberof_group"
            title={
              <TabTitleText>
                User groups{" "}
                <Badge key={0} isRead>
                  {userGroupsLength}
                </Badge>
              </TabTitleText>
            }
          >
            <MemberOfUserGroups
              user={user}
              from={props.from}
              isUserDataLoading={userQuery.isFetching}
              onRefreshUserData={onRefreshUserData}
            />
          </Tab>
          <Tab
            eventKey={1}
            name="memberof_netgroup"
            title={
              <TabTitleText>
                Netgroups{" "}
                <Badge key={1} isRead>
                  {netgroupsLength}
                </Badge>
              </TabTitleText>
            }
          >
            <MemberOfNetgroups
              user={user}
              from={props.from}
              isUserDataLoading={userQuery.isFetching}
              onRefreshUserData={onRefreshUserData}
            />
          </Tab>
          <Tab
            eventKey={2}
            name="memberof_role"
            title={
              <TabTitleText>
                Roles{" "}
                <Badge key={2} isRead>
                  {rolesLength}
                </Badge>
              </TabTitleText>
            }
          >
            <MemberOfRoles
              user={user}
              from={props.from}
              isUserDataLoading={userQuery.isFetching}
              onRefreshUserData={onRefreshUserData}
            />
          </Tab>
          <Tab
            eventKey={3}
            name="memberof_hbacrule"
            title={
              <TabTitleText>
                HBAC rules{" "}
                <Badge key={3} isRead>
                  {hbacRulesLength}
                </Badge>
              </TabTitleText>
            }
          >
            <MemberOfHbacRules
              user={user}
              from={props.from}
              isUserDataLoading={userQuery.isFetching}
              onRefreshUserData={onRefreshUserData}
            />
          </Tab>
          <Tab
            eventKey={4}
            name="memberof_sudorule"
            title={
              <TabTitleText>
                Sudo rules{" "}
                <Badge key={4} isRead>
                  {sudoRulesLength}
                </Badge>
              </TabTitleText>
            }
          >
            <MemberOfSudoRules
              user={user}
              isUserDataLoading={userQuery.isFetching}
              onRefreshUserData={onRefreshUserData}
            />
          </Tab>
        </Tabs>
      </PageSection>
    </Page>
  );
};

export default UserMemberOf;
