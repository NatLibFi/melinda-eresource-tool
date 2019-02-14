/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for transforming MARC records in Melinda
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-muuntaja
*
* melinda-muuntaja program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-muuntaja is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import { Map } from 'immutable'; 
import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD, SET_SOURCE_RECORD_ERROR, SET_SOURCE_RECORD_ID, ADD_SOURCE_RECORD_FIELD, REMOVE_SOURCE_RECORD_FIELD, RESET_SOURCE_RECORD } from '../ui-actions';
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import MarcRecord from 'marc-record-js';

const INITIAL_STATE = Map({
  state: 'EMPTY'
});

export default function sourceRecord(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_SOURCE_RECORD:
      return loadSourceRecord(state, action.id);
    case SET_SOURCE_RECORD:
      return setSourceRecord(state, action.record, action.subrecords);
    case SET_SOURCE_RECORD_ERROR:
      return setSourceRecordError(state, action.error);
    case SET_SOURCE_RECORD_ID:
      return setSourceRecordId(state, action.recordId);
    case ADD_SOURCE_RECORD_FIELD: 
      return setFieldSelected(state, action.field);
    case REMOVE_SOURCE_RECORD_FIELD:
      return setFieldUnselected(state, action.field);
    case RESET_SOURCE_RECORD:
    case RESET_WORKSPACE:
      return INITIAL_STATE;
  }
  return state;
}

export function loadSourceRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
  
}

export function setSourceRecord(state, record, subrecords) {
  
  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['hasSubrecords'], () => subrecords && subrecords.length > 0)
    .updateIn(['record'], () => record);
}

export function setSourceRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setSourceRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}

export function setFieldSelected(state, field) {
  const record = state.get('record');
  record.fields
    .filter(recordField => recordField.uuid === field.uuid)
    .forEach(recordField => {
      recordField.fromOther = true;
      recordField.wasUsed = true;
    });
  return state.set('record', new MarcRecord(record));

}

export function setFieldUnselected(state, field) {
  const record = state.get('record');
  record.fields
    .filter(recordField => recordField.uuid === field.uuid)
    .forEach(recordField => {
      recordField.fromOther = false;
      recordField.wasUsed = false;
    });
  return state.set('record', new MarcRecord(record));
}