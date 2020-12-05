import { AsyncValidateOption, ValidateJS, ValidateOption } from 'validate.js';
import ControlRules from '../ControlRules';
import FormControl from '../FormControl';
import { IFormRuleItem } from './control-rules';

export interface IFormControlsMap {
  [key: string]: FormControl;
}

export interface IFormValuesMap {
  [key: string]: string | null;
}

export interface IFormRules {
  [key: string]: IFormRuleItem;
}

export interface IRawFormRules {
  [key: string]: ControlRules;
}

interface ICustomValidateOption {
  instanceCount?: number;
}

export type IFormidateOptions = ValidateOption & AsyncValidateOption & ICustomValidateOption;

export interface IValidateJS extends ValidateJS {
  Promise?: any;
}

export type IValidationCallback = ((valid: boolean, controls: IFormControlsMap) => void) | null;

export type AllowedEvents = Array<'input' | 'focus' | 'blur'>;

export interface IDetailedError {
  attribute: string;
  value: string;
  validator: string;
  globalOptions: IFormidateOptions;
  attributes: IFormValuesMap;
  options: any;
  error: string;
}

export interface IMappedErrors {
  [key: string]: { [key: string]: string };
}
