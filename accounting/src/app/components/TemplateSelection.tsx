// TemplateSelection.jsx
import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
} from "@mui/material";

const TemplateSelection = ({
  defaultTemplates,
  customTemplates,
  selectedTemplateId,
  onTemplateSelection,
}: any) => {
  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="template-select-label">Välj en mall</InputLabel>
      <Select
        labelId="template-select-label"
        value={selectedTemplateId}
        label="Välj en mall"
        onChange={(e) => onTemplateSelection(e.target.value)}
      >
        <ListSubheader>Låsta kontoplaner</ListSubheader>
        {defaultTemplates.map((template: any) => (
          <MenuItem key={template.id} value={template.id}>
            {template.templateName}
          </MenuItem>
        ))}
        <ListSubheader>Mina kontoplaner</ListSubheader>
        {customTemplates.map((template: any) => (
          <MenuItem key={template.id} value={template.id}>
            {template.templateName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TemplateSelection;
