import React from 'react';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { User } from '@/data/users';

interface ChecklistItem {
    id: string;
    concept: string;
    section: string;
    sectionId: string;
    completed: boolean;
}

interface ChecklistTableProps {
    orderedSections: string[];
    groupedItems: Record<string, ChecklistItem[]>;
    users: Omit<User, 'password'>[];
    dueDates: { [key: string]: string };
    currentUser: User | null;
    hasPermission: (user: User | null, permission: string) => boolean;
    toggleItemCompletion: (itemId: string) => void;
    handleDeleteItem: (itemId: string) => void;
    handleUserAssignment: (itemId: string, userId: string) => void;
    handleDueDateChange: (itemId: string, date: string) => void;
    getFieldValue: (itemId: string, fieldName: string) => string;
    openModal: (
        itemId: string,
        fieldName: string,
        fieldType?: 'text' | 'number' | 'select',
        selectOptions?: { value: string; label: string }[]
    ) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({
    orderedSections,
    groupedItems,
    users,
    dueDates,
    currentUser,
    hasPermission,
    toggleItemCompletion,
    handleDeleteItem,
    handleUserAssignment,
    handleDueDateChange,
    getFieldValue,
    openModal
}) => {
    // Opciones para los selects
    const tipoOptions = [
        { value: 'freelance', label: 'FREELANCE' },
        { value: 'interno', label: 'INTERNO' }
    ];

    const cuentasOptions = [
        { value: 'compartido', label: 'COMPARTIDO' },
        { value: 'no_compartido', label: 'NO COMPARTIDO' }
    ];

    const contratacionOptions = [
        { value: 'imss', label: 'IMSS' },
        { value: 'honorarios', label: 'HONORARIOS' },
        { value: 'imss_honorarios', label: 'IMSS+HONORARIOS' }
    ];

    return (
        <table className="checklist-table">
            <thead>
                <tr>
                    <th>✓</th>
                    <th>Eliminar</th>
                    <th>Código</th>
                    <th>Concepto</th>
                    <th>Perfil</th>
                    <th>Tipo</th>
                    <th>Fecha de entrega</th>
                    <th>Kpi</th>
                    <th>Meta</th>
                    <th>Frecuencia</th>
                    <th>Duración</th>
                    <th>Sueldo/Costo</th>
                    <th>Otros Items</th>
                    <th>Otras Cuentas</th>
                    <th>Tipo de Contratación</th>
                    <th>Días de Pago</th>
                    <th>Contrato a Firmar</th>
                    <th>Propuesta</th>
                    <th>Escritorio, Silla Etc</th>
                    <th>Viajes/Hospedajes Descriptivo</th>
                    <th>Viajes/Hospedajes Monto</th>
                    <th>Equipo de Cómputo</th>
                    <th>Recursos Tecnológicos y Materiales Adicionales Descriptivo</th>
                    <th>Recursos Tecnológicos y Materiales Adicionales Monto</th>
                    <th>Empresa Descriptivo</th>
                    <th>Empresa Monto</th>
                    <th>Pauta Descriptivo</th>
                    <th>Pauta Monto</th>
                    <th>Otros Gastos Descriptivos</th>
                    <th>Otros Gastos Monto</th>
                </tr>
            </thead>
            <tbody>
                {orderedSections.map((sectionName) => {
                    const items = groupedItems[sectionName];
                    return (
                        <React.Fragment key={sectionName}>
                            <tr className="section-header">
                                <td colSpan={30} className="section-title">
                                    {sectionName}
                                </td>
                            </tr>
                            {items.map((item) => (
                                <tr key={item.id} className={item.completed ? 'completed' : ''}>
                                    <td className="checkbox-cell">
                                        <button
                                            className="checkbox-button"
                                            onClick={() => toggleItemCompletion(item.id)}
                                        >
                                            {item.completed ? (
                                                <CheckCircle2 size={18} className="check-icon completed" />
                                            ) : (
                                                <Circle size={18} className="check-icon" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="delete-cell">
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteItem(item.id)}
                                            title="Eliminar elemento"
                                        >
                                            <Trash2 size={18} className="delete-icon" />
                                        </button>
                                    </td>
                                    <td className="checklist-item-id">{item.id}</td>
                                    <td className="task-cell" style={{ minWidth: "200px", maxWidth: "200px" }}>{item.concept}</td>
                                    <td>
                                        <select
                                            className="table-input"
                                            value={getFieldValue(item.id, 'assignedUser') || ''}
                                            onChange={(e) => handleUserAssignment(item.id, e.target.value)}
                                            disabled={!currentUser || !hasPermission(currentUser, 'assign_tasks')}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'tipo')}
                                            placeholder="Tipo"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Tipo', 'select', tipoOptions)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            className="table-input"
                                            value={dueDates[item.id] || ''}
                                            onChange={(e) => handleDueDateChange(item.id, e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'kpi')}
                                            placeholder="KPI"
                                            readOnly
                                            onClick={() => openModal(item.id, 'KPI')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'meta')}
                                            placeholder="Meta"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Meta')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'frecuencia')}
                                            placeholder="Frecuencia"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Frecuencia')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'duracion')}
                                            placeholder="Duración"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Duración')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'sueldo')}
                                            placeholder="Sueldo/Costo"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Sueldo/Costo', 'number')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'otros_items')}
                                            placeholder="Otros items"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Otros Items')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'otras_cuentas')}
                                            placeholder="Otras Cuentas"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Otras Cuentas', 'select', cuentasOptions)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'tipo_contratacion')}
                                            placeholder="Tipo de Contratación"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Tipo de Contratación', 'select', contratacionOptions)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'dias_pago')}
                                            placeholder="Días de pago"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Días de Pago')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'contrato')}
                                            placeholder="Contrato"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Contrato a Firmar')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'propuesta')}
                                            placeholder="Propuesta"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Propuesta')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'escritorio')}
                                            placeholder="Escritorio, silla, etc."
                                            readOnly
                                            onClick={() => openModal(item.id, 'Escritorio, Silla Etc')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'viajes_desc')}
                                            placeholder="Viajes/Hospedajes desc."
                                            readOnly
                                            onClick={() => openModal(item.id, 'Viajes/Hospedajes Descriptivo')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'viajes_monto')}
                                            placeholder="Monto viajes"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Viajes/Hospedajes Monto', 'number')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'equipo_computo')}
                                            placeholder="Equipo de cómputo"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Equipo de Cómputo')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'recursos_desc')}
                                            placeholder="Recursos tecnológicos desc."
                                            readOnly
                                            onClick={() => openModal(item.id, 'Recursos Tecnológicos y Materiales Adicionales Descriptivo')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'recursos_monto')}
                                            placeholder="Monto recursos"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Recursos Tecnológicos y Materiales Adicionales Monto', 'number')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'empresa_desc')}
                                            placeholder="Empresa desc."
                                            readOnly
                                            onClick={() => openModal(item.id, 'Empresa Descriptivo')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'empresa_monto')}
                                            placeholder="Monto empresa"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Empresa Monto', 'number')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'pauta_desc')}
                                            placeholder="Pauta desc."
                                            readOnly
                                            onClick={() => openModal(item.id, 'Pauta Descriptivo')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'pauta_monto')}
                                            placeholder="Monto pauta"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Pauta Monto', 'number')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'otros_gastos_desc')}
                                            placeholder="Otros gastos desc."
                                            readOnly
                                            onClick={() => openModal(item.id, 'Otros Gastos Descriptivos')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="table-input"
                                            value={getFieldValue(item.id, 'otros_gastos_monto')}
                                            placeholder="Monto otros"
                                            readOnly
                                            onClick={() => openModal(item.id, 'Otros Gastos Monto', 'number')}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
    );
};

export default ChecklistTable;
