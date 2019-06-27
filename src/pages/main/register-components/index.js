import React, { Component } from 'react';

import { Redirect } from 'react-router';
import { EditingState, PagingState, IntegratedPaging } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableEditColumn, TableEditRow, PagingPanel } from '@devexpress/dx-react-grid-bootstrap4';

import Select from 'react-select';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import api from '../../../services/api';

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
    <CommandButton icon="plus" hint="Criar novo componente" onExecute={onExecute} />
);

const EditButton = ({ onExecute }) => (
    //<CommandButton icon="pencil" hint="Editar" color="text-warning" onExecute={onExecute} />
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
    cancel: CancelButton
};

const tableMessages = {
    noData: 'Sem componentes'
};

const Command = ({ id, onExecute }) => {
    const ButtonComponent = commandComponents[id];
    return (
        <ButtonComponent onExecute={onExecute} />
    );
};

export default class RegisterComponents extends React.PureComponent {

    constructor(props) {
        super(props);

        this.changeCurrentPage = currentPage => this.setState({ currentPage });
        this.changePageSize = pageSize => this.setState({ pageSize });
    }

    state = {
        categories: [],
        loadingCategories: true,
        nmComponent: '',
        selectedGroup: null,
        columns: [
            { name: 'id', title: 'ID geral' },
            { name: 'nm_component', title: 'Descrição do componente' },
            { name: 'nm_category', title: 'Categoria' },
            { name: 'action', title: 'Nutrientes' }
        ],
        rows: [],
        currentPage: 5,
        pageSize: 5,
        pageSizes: [5, 10, 30],
        toNutrientEdition: {
            state: false,
            componentId: null
        }
    };

    fetchComponents = () => {
        api.get('/component-category').then(response => {
            this.setState({
                categories: [
                    ...response.data.map(c => {
                        return {
                            value: c.id,
                            label: c.nm_category
                        }
                    })
                ],
                loadingCategories: false
            });
        });
    }

    renderEditCell = (props) => {
        const { column } = props;

        if (column.name == 'nm_category') {
            return this.renderLookupEditCell();
        } else if (column.name == 'id' || column.name == 'action') {
            return <TableEditRow.Row {...props} />;
        }
        return <TableEditRow.Cell {...props} width={'220px'} onChange={this.handleChange()} />;
    };

    loadComponents() {
        api.get(`/component`).then(response => {
            this.setState({
                rows: [
                    ...response.data.map(r => {
                        return {
                            id: r.id,
                            nm_component: r.nm_component,
                            nm_category: r.category.nm_category,
                            action: this.renderButtonAction.call(this, r.id)
                        }
                    })
                ]
            });
        });
    }

    componentDidMount() {
        this.fetchComponents();

        this.loadComponents();
    }

    handleChange = value => {
        if (value) {
            this.setState({
                nm_component: value
            });
        }
    }

    handleChangeList = event => {
        this.setState({
            selectedGroup: event.value
        });
    }

    commitChanges = ({ added, changed, deleted }) => {

        if (added) {

            const newComponent = added[0];
            const data = {
                componentName: newComponent.nm_component,
                categoryId: this.state.selectedGroup
            };

            api.post('/component/create', data).then(() => {
                this.loadComponents();
            });
        } else if (changed) {
            /*ToDO */
        } else if (deleted) {

            const idToDelete = this.state.rows[deleted].id;

            api.delete(`/component/${idToDelete}`).then(() => {
                this.loadComponents();
            });
        }
    }

    renderLookupEditCell = () => (
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
                            isSearchable
                            isLoading={this.state.loadingCategories}
                            options={this.state.categories}
                            onChange={this.handleChangeList}
                            id="id_category"
                            name="id_category"
                            valueKey="id"
                            labelKey="nm_category" />
                    </Form.Group>
                </Form>
            </div>
        </td>
    )

    renderButtonAction = (componentId) => (

        <div className="mt-0">
            <Button
                variant="outline-primary"
                onClick={() => {
                    this.setState({
                        toNutrientEdition: {
                            state: true,
                            componentId
                        }
                    })
                }}>

                Editar
                </Button>
        </div>
    )

    render() {

        if (this.state.toNutrientEdition.state === true) {
            return (<Redirect to={`/main/register-nutrients/${this.state.toNutrientEdition.componentId}`} />)
        }

        const { columns, rows, currentPage, pageSize, pageSizes } = this.state;

        return (
            <div className="card">
                <Grid
                    rows={rows}
                    columns={columns} >

                    <PagingState
                        currentPage={currentPage}
                        onCurrentPageChange={this.changeCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={this.changePageSize}
                        defaultCurrentPage={0}
                        defaultPageSize={5}
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
