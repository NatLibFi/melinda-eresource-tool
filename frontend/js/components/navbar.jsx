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

import React from 'react';
import PropTypes from 'prop-types';
import { commitMerge} from '../ui-actions';
import {connect} from 'react-redux';
import { mergeButtonEnabled } from '../selectors/merge-status-selector';
import '../../styles/components/navbar.scss';
import { removeSession } from 'commons/action-creators/session-actions';
import melindaLogo from '../../images/melinda-logo-white.png';

export class NavBar extends React.Component {
  
  static propTypes = {
    commitMerge: PropTypes.func.isRequired,
    mergeStatus: PropTypes.string,
    mergeButtonEnabled: PropTypes.bool.isRequired,
    removeSession: PropTypes.func.isRequired,
    config: PropTypes.object,
    appTitle: PropTypes.string.isRequired,
    username: PropTypes.string
  };

  constructor() {
    super();
    this.endSession = this.endSession.bind(this);
  }

  componentDidMount() {
    window.$('.dropdown-navbar').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      hover: false,
      gutter: 0,
      belowOrigin: true,
      alignment: 'right'
    });
  }

  disableIfMergeNotPossible() {
    return this.props.mergeButtonEnabled ? '' : 'disabled';
  }

  endSession() {
    this.props.removeSession();
  }
  
  clearLocalStorage() {
    window.localStorage.clear();
  }

  render() {
    const { username, appTitle } = this.props;

    return (
      <div className="navbar-fixed">
        <nav> 
          <div className="nav-wrapper">
            <img 
              className="mt-logo left" 
              src={melindaLogo}
            />
            <ul id="nav" className="left">
              <li className="heading">{appTitle}</li>
            </ul>
            <ul id="nav" className="right">
              <li><a href="https://www.kiwi.fi/x/iBcvBQ" target="_blank" rel="noopener noreferrer">
                <i
                  className="material-icons tooltip"
                  title="Käyttöohje">help_outline
                </i>
              </a>
              </li>
              <li>
                <a
                  className="dropdown-navbar dropdown-button-menu"
                  href="#" data-activates="mainmenu">
                  <i className="material-icons">account_circle</i>
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <ul
          id='mainmenu'
          className='dropdown-content'>
          <li className="user-name-menu-item">{username ? username : ''}</li>
          <li className="divider"/>
          <li>
            <a
              href="#"
              onClick={() => {this.endSession(); this.clearLocalStorage();}}>Kirjaudu ulos
            </a>
            <a>
              {this.props.config.userInfo.name}
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    mergeButtonEnabled: mergeButtonEnabled(state),
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    config: state.getIn(['config']).toJS()
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  { removeSession, commitMerge }
)(NavBar);
