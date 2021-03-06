import React, { Component } from 'react';

import { Redirect } from 'react-router';

import { EditingState } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableEditColumn, TableEditRow } from '@devexpress/dx-react-grid-bootstrap4';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

import api from '../../../services/api';
import userService from '../../../services/user.service';

const CommandButton = ({
  onExecute, icon, text, hint, color,
}) => (
        <button
            type="button"
            className="btn btn-link"
            style={{ padding: 11 }}
            onClick={(e) => {
                onExecute();
                e.stopPropagation();
            }}
            title={hint}
        >
            <span className={color || 'undefined'}>
                {icon ? <i className={`oi oi-${icon}`} style={{ marginRight: text ? 5 : 0 }} /> : null}
                {text}
            </span>
        </button>
    );

const AddButton = ({ onExecute }) => (
    <CommandButton icon="plus" onExecute={onExecute} />
);

const DeleteButton = ({ onExecute }) => (
    <CommandButton icon="trash" color="text-danger" onExecute={onExecute} />
);

const CommitButton = ({ onExecute }) => (
    <CommandButton icon="check" color="text-success" onExecute={onExecute} />
);

const CancelButton = ({ onExecute }) => (
    <CommandButton icon="x" color="text-danger" onExecute={onExecute} />
);

const commandComponents = {
    add: AddButton,
    delete: DeleteButton,
    commit: CommitButton,
    cancel: CancelButton
};

const Command = ({ id, onExecute }) => {
    const ButtonComponent = commandComponents[id];
    return (
        <ButtonComponent
            onExecute={onExecute}
        />
    );
};

const tableMessages = {
  noData: 'Sem pacientes'
}

const getRowId = row => row.id;

export default class NutritionistList extends Component {

  state = {
    columns: [
      { name: 'nm_nutritionist', title: 'Nome do Nutricionista' },
      { name: 'ds_email', title: 'E-mail' },
      { name: 'actions', title: 'Ações' }
    ],
    editingStateColumnExtensions: [
      { columnName: 'nm_nutritionist', editingEnabled: false },
    ],
    addedRows: [],
    rows: [],
    toViewCalendar: {
      state: false,
      nutritionistId: null
    }
  }

  changeAddedRows = addedRows => {
    const initialized = addedRows.map(row => row);
    this.setState({ addedRows: initialized });
  }

  addActions = nutritionistId => {
    return (
      <ButtonGroup>
        <Button
          variant="outline-primary"
          onClick={() => {
            this.setState({
              toViewCalendar: {
                state: true,
                nutritionistId
              }
            })
          }}>
          Calendário
        </Button>
      </ButtonGroup>
    )
  }

  loadNutritionists = () => {
    api.get(`/nutritionist-patient/${userService.id}`).then(response => {
      this.setState({
        rows: [
          ...response.data.map(r => {
            return {
              id: r.id,
              nm_nutritionist: r.nutritionist.nm_person,
              ds_email: r.nutritionist.ds_email,
              actions: this.addActions.call(this, r.patient.id)
            }
          })
        ]
      });
    });
  }

  renderEditCell = (props) => {
    const { column } = props;

    if (column.name === 'actions') {
      return <TableEditRow.Row {...props} />;
    }
    return <TableEditRow.Cell {...props} />;
  };


  componentDidMount() {
    this.loadNutritionists();
  }

  commitChanges = ({ added, deleted }) => {
    if (added) {
      const newPatient = added[0];

      api.post(`/nutritionist-patient/create`, {
        nutritionistId: userService.id,
        patientEmail: newPatient.ds_email
      }).then(() => {
        this.loadNutritionists();
      });
    }

    if (deleted) {
      api.delete(`/nutritionist-patient/${deleted}`).then(() => {
        this.loadNutritionists();
      });
    }
  }

  render() {
    if (this.state.toViewCalendar.state === true) {
      return (<Redirect to={`/main/view-calendar/${this.state.toViewCalendar.nutritionistId}/${userService.id}`} />)
    }

    const { columns, rows, addedRows, editingStateColumnExtensions } = this.state;

    return (
      <div className="card">
        <Grid
          rows={rows}
          columns={columns}
          getRowId={getRowId} >

          <EditingState
            columnExtensions={editingStateColumnExtensions}
            onCommitChanges={this.commitChanges}
            addedRows={addedRows}
            onAddedRowsChange={this.changeAddedRows} />
          <Table
            messages={tableMessages} />
          <TableHeaderRow />
          <TableEditRow  cellComponent={this.renderEditCell} />
          <TableEditColumn
            showAddCommand={!addedRows.length}
            showDeleteCommand
            commandComponent={Command} />
        </Grid>
      </div>
    );
  }
}
