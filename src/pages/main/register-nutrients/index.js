import React, { Component } from 'react';

import { EditingState, PagingState, IntegratedPaging } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableEditColumn, TableEditRow, PagingPanel } from '@devexpress/dx-react-grid-bootstrap4';
import Select from 'react-select';
import Form from 'react-bootstrap/Form';
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
    <CommandButton icon="plus" hint="Criar novo nutriente" onExecute={onExecute} />
);

const EditButton = ({ onExecute }) => (
   // <CommandButton icon="pencil" hint="Editar" color="text-warning" onExecute={onExecute} />
   null
);

const DeleteButton = ({ onExecute }) => (
    <CommandButton
        icon="trash"
        hint="Deletar"
        color="text-danger"
        onExecute={onExecute}
    />
);

const CommitButton = ({ onExecute }) => (
    <CommandButton icon="check" hint="Salvar" color="text-success" onExecute={onExecute} />
);

const CancelButton = ({ onExecute }) => (
    <CommandButton icon="x" hint="Cancelar" color="text-danger" onExecute={onExecute} />
);

const commandComponents = {
    add: AddButton,
    edit: EditButton,
    delete: DeleteButton,
    commit: CommitButton,
    cancel: CancelButton,
};

const tableMessages = {
    noData: 'Sem nutrientes'
}

const Command = ({ id, onExecute }) => {
    const ButtonComponent = commandComponents[id];
    return (
        <ButtonComponent
            onExecute={onExecute}
        />
    );
};

export default class RegisterNutrients extends React.PureComponent {

    constructor(props) {
        super(props);

        this.changeCurrentPage = currentPage => this.setState({ currentPage });
        this.changePageSize = pageSize => this.setState({ pageSize });
    }

    state = {
        nutrients: [],
        loadingNutrient: true,
        selectedGroup: null,
        components: [],
        loadingComponents: true,
        qtNutrient: 0,
        componentId: null,
        columns: [
            { name: 'id', title: 'ID geral' },
            { name: 'ds_nutrient', title: 'Nutriente' },
            { name: 'qt_nutrient', title: 'Quantidade' }
        ],
        rows: [],
        currentPage: 10,
        pageSize: 10,
        pageSizes: [10, 30],
        dsComp: null
    }

    fetchComponents = () => {
        api.get('/nutrient').then(response => {
            this.setState({
                nutrients: [
                    ...response.data.map(c => {
                        return {
                            value: c.id,
                            label: c.ds_nutrient
                        }
                    })
                ],
                loadingNutrient: false
            });
        });
    }

    renderEditCell = (props) => {
        const { column } = props;

        if (column.name == 'ds_nutrient') {
            return this.renderLookupNutrient();
        } else if (column.name == 'id') {
            return <TableEditRow.Row {...props} />;
        }
        return <TableEditRow.Cell {...props} width={'350px'} />;
    }

    renderLookupNutrient = () => (
        <td
            style={{
                verticalAlign: 'middle',
                padding: 1,
            }}
        >
            <div className="mt-3">
                <Form>
                    <Form.Group>
                        <Select
                            isLoading={this.state.loadingNutrient}
                            closeMenuOnSelect={false}
                            options={this.state.nutrients}
                            onChange={this.handleChangeList}
                            id="id_nutrient"
                            name="id_nutrient"
                            valueKey="id"
                            labelKey="nm_nutrient" />
                    </Form.Group>
                </Form>
            </div>
        </td>
    );

    componentDidMount() {
        this.fetchComponents();

        this.loadNutrient();
    }

    loadNutrient() {
        api.get(`/component-nutrient/${this.props.match.params.componentId}`).then(response => {

            let dsCompData = '';

            let rowData = [
                ...response.data.map(r => {

                    if (!dsCompData) {
                        dsCompData = r.component.nm_component;
                    }

                    return {
                        id: r.id,
                        nm_component: r.component.nm_component,
                        ds_nutrient: r.nutrient.ds_nutrient,
                        qt_nutrient: r.qt_nutrient
                    }
                })
            ];

            this.setState({
                rows: rowData,
                dsComp: dsCompData,
                componentId: this.props.match.params.componentId
            });
        });
    }

    handleChangeList = event => {
        this.setState({
            selectedGroup: event.value
        });
    }

    commitChanges = ({ added, changed, deleted }) => {

        if (added) {

            const data = {
                componentId: this.state.componentId,
                nutrientId: this.state.selectedGroup,
                nutrientQuant: added[0].qt_nutrient
            };

            api.post('/component-nutrient/create', data).then(() => {
                this.loadNutrient();
            });
        } else if (changed) {
            /*ToDO */
        } else if (deleted) {

            const idToDelete = this.state.rows[deleted].id;

            api.delete(`/component-nutrient/${idToDelete}`).then(() => {
                this.loadNutrient();
            });
        }
    }

    render() {
        const { columns, rows, currentPage, pageSize, pageSizes, dsComp} = this.state;

        return (
            <div className="card">

                <h3>{dsComp}</h3>

                <Grid
                    rows={rows}
                    columns={columns} >

                    <PagingState
                        currentPage={currentPage}
                        onCurrentPageChange={this.changeCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={this.changePageSize}
                        defaultCurrentPage={0}
                        defaultPageSize={10}
                    />
                    <EditingState
                        onCommitChanges={this.commitChanges} />

                    <IntegratedPaging />
                    <Table
                        messages={tableMessages} />
                    <TableHeaderRow />
                    <TableEditRow cellComponent={this.renderEditCell} />
                    <TableEditColumn
                        showAddCommand
                        showEditCommand
                        showDeleteCommand
                        commandComponent={Command} />
                    <PagingPanel
                        pageSizes={pageSizes}
                    />
                </Grid>
            </div>
        );
    }
}
