import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Downshift from "downshift";
import * as React from "react";
import { compareTwoStrings } from "string-similarity";

import i18n from "../../i18n";
import ArrowDropdownIcon from "../../icons/ArrowDropdown";

interface SingleAutocompleteSelectFieldProps {
  name: string;
  choices: Array<{
    label: string;
    value: any;
  }>;
  value?: {
    label: string;
    value: any;
  };
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  custom?: boolean;
  helperText?: string;
  label?: string;
  fetchChoices?(value: string);
  onChange(event);
}

interface SingleAutocompleteSelectFieldState {
  choices: Array<{
    label: string;
    value: string;
  }>;
}

const decorate = withStyles(theme => ({
  container: {
    flexGrow: 1,
    position: "relative" as "relative"
  },
  inputRoot: {
    flexWrap: "wrap" as "wrap"
  },
  paper: {
    left: 0,
    marginTop: theme.spacing.unit,
    position: "absolute" as "absolute",
    right: 0,
    zIndex: 1
  }
}));

const SingleAutocompleteSelectFieldComponent = decorate<
  SingleAutocompleteSelectFieldProps
>(
  ({
    choices,
    classes,
    custom,
    disabled,
    helperText,
    label,
    loading,
    name,
    placeholder,
    value,
    fetchChoices,
    onChange
  }) => {
    const handleChange = item => onChange({ target: { name, value: item } });

    return (
      <Downshift
        selectedItem={value}
        itemToString={item => (item ? item.label : "")}
        onSelect={handleChange}
        onInputValueChange={fetchChoices}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          highlightedIndex
        }) => {
          const isCustom =
            choices && selectedItem
              ? choices.filter(c => c.value === selectedItem.value).length === 0
              : false;
          return (
            <div className={classes.container}>
              <TextField
                InputProps={{
                  classes: {
                    root: classes.inputRoot
                  },
                  ...getInputProps({
                    placeholder
                  }),
                  endAdornment: <ArrowDropdownIcon />
                }}
                disabled={disabled}
                helperText={helperText}
                label={label}
                fullWidth={true}
              />
              {isOpen && (
                <Paper className={classes.paper} square>
                  {loading ? (
                    <MenuItem disabled={true} component="div">
                      {i18n.t("Loading...")}
                    </MenuItem>
                  ) : choices.length > 0 || custom ? (
                    <>
                      {choices.map((suggestion, index) => (
                        <MenuItem
                          key={JSON.stringify(suggestion)}
                          selected={highlightedIndex === index}
                          component="div"
                          {...getItemProps({ item: suggestion })}
                        >
                          {suggestion.label}
                        </MenuItem>
                      ))}
                      {custom && (
                        <MenuItem
                          key={"customValue"}
                          selected={isCustom}
                          component="div"
                          {...getItemProps({
                            item: { label: inputValue, value: inputValue }
                          })}
                        >
                          {i18n.t("Add custom value")}
                        </MenuItem>
                      )}
                    </>
                  ) : (
                    <MenuItem disabled={true} component="div">
                      {i18n.t("No results found")}
                    </MenuItem>
                  )}
                </Paper>
              )}
            </div>
          );
        }}
      </Downshift>
    );
  }
);
export class SingleAutocompleteSelectField extends React.Component<
  SingleAutocompleteSelectFieldProps,
  SingleAutocompleteSelectFieldState
> {
  state = { choices: this.props.choices };

  handleInputChange = (value: string) => {
    this.setState({
      choices: this.props.choices.sort((a, b) => {
        const ratingA = compareTwoStrings(value || "", a.label);
        const ratingB = compareTwoStrings(value || "", b.label);
        if (ratingA > ratingB) {
          return -1;
        }
        if (ratingA < ratingB) {
          return 1;
        }
        return 0;
      })
    });
  };

  render() {
    if (!!this.props.fetchChoices) {
      return <SingleAutocompleteSelectFieldComponent {...this.props} />;
    }
    return (
      <SingleAutocompleteSelectFieldComponent
        {...this.props}
        choices={this.state.choices}
        fetchChoices={this.handleInputChange}
      />
    );
  }
}
export default SingleAutocompleteSelectField;
