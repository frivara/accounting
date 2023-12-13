// AccountTable.jsx
import React, { useCallback } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TableContainer,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCodeSearch from "@/app/components/AccountCodeSearch";
import { debounce } from "lodash";

const AccountTable = ({
  accounts,
  handleAccountChange,
  handleDeleteAccount,
  newAccount,
  handleNewAccountChange,
  handleAddAccount,
  lastAccountElementRef,
}: any) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedHandleNewAccountChange = useCallback(
    debounce((field, value) => handleNewAccountChange(field, value), 100),
    [handleNewAccountChange]
  );

  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: "200px", overflowY: "auto" }}
    >
      <Table stickyHeader aria-label="sticky table">
        <TableBody>
          <TableRow>
            <TableCell>
              <AccountCodeSearch
                currentAccountId={newAccount.code}
                onSelectAccount={(account: { code: any }) =>
                  handleNewAccountChange("code", account.code)
                }
              />
            </TableCell>
            <TableCell>
              <TextField
                placeholder="Kontonamn"
                value={newAccount.name}
                onChange={(e) =>
                  debouncedHandleNewAccountChange("name", e.target.value)
                }
              />
            </TableCell>
            <TableCell>
              <Button onClick={handleAddAccount}>Lägg till konto</Button>
            </TableCell>
          </TableRow>
          {accounts.map(
            (
              account: { code: unknown; name: unknown },
              index: React.Key | null | undefined
            ) => (
              <TableRow
                key={index}
                ref={
                  index === accounts.length - 1 ? lastAccountElementRef : null
                }
              >
                <TableCell>
                  <TextField
                    value={account.code}
                    onChange={(e) =>
                      handleAccountChange(index, "code", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={account.name}
                    onChange={(e) =>
                      handleAccountChange(index, "name", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleDeleteAccount(index)}>
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountTable;
