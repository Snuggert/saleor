import { withStyles } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import * as React from "react";

interface ControlledSwitchProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  name: string;
  uncheckedLabel?: string;
  onChange?(event: React.ChangeEvent<any>);
}

const decorate = withStyles(theme => ({
  label: {
    marginLeft: theme.spacing.unit * 2
  }
}));
export const ControlledSwitch = decorate<ControlledSwitchProps>(
  ({ classes, checked, disabled, onChange, label, name, uncheckedLabel }) => (
    <FormControlLabel
      control={
        <Switch
          onChange={() =>
            onChange({ target: { name, value: !checked } } as any)
          }
          checked={checked}
          color="primary"
          name={name}
        />
      }
      label={
        <div className={classes.label}>
          {uncheckedLabel ? (checked ? label : uncheckedLabel) : label}
        </div>
      }
      disabled={disabled}
    />
  )
);
ControlledSwitch.displayName = "ControlledSwitch";
export default ControlledSwitch;
