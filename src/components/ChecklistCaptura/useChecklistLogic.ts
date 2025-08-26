import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllUsers, hasPermission, User } from '@/data/users';
import { useAuthStore } from '@/stores/authStore';
import { storage } from '@/utils/storage';

interface ChecklistItem {
    id: string;
    concept: string;
    section: string;
    sectionId: string;
    completed: boolean;
}

interface FormDataItem {
    id: string;
    concept: string;
    cost?: number;
    quantity?: number;
    discount?: number;
    subtotal?: number;
}

type FormDataSection = { [key: string]: FormDataItem[] };

interface LocationState {
    clientName?: string;
    selectedItems?: { [key: string]: boolean };
    allData?: FormDataSection;
}

interface TaskAssignment {
    itemId: string;
    userId: string;
    concept: string;
    dueDate: string;
    section: string;
    sectionId: string;
    completed?: boolean;
}

export const useChecklistLogic = () => {
    const location = useLocation();
    const { user: currentUser } = useAuthStore();

    const [isVisible, setIsVisible] = useState(false);
    const [clientName, setClientName] = useState('');
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

    const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>(() => {
        try {
            const savedAssignments = storage.getItem<TaskAssignment[]>('taskAssignments');
            return savedAssignments || [];
        } catch (error) {
            console.error('Error loading task assignments:', error);
            return [];
        }
    });

    const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>(() => {
        const savedValues = storage.getItem<{ [key: string]: string }>('fieldValues');
        return savedValues || {};
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        fieldName: '',
        fieldType: 'text' as 'text' | 'number' | 'select',
        initialValue: '',
        selectOptions: [] as { value: string; label: string }[],
        onSave: (value: string) => { console.log('Default save function', value); }
    });

    const [dueDates, setDueDates] = useState<{ [key: string]: string }>(() => {
        try {
            const savedDates = storage.getItem<{ [key: string]: string }>('dueDates');
            return savedDates || {};
        } catch (error) {
            console.error('Error loading due dates:', error);
            return {};
        }
    });

    // Mapeo de secciones con sus títulos correctos
    const sectionMapping = useMemo(() => ({
        'estrategia': 'Set Up Estrategia Digital',
        'antropologicos': 'Estudios Antropológicos',
        'otros-estudios': 'Otros Estudios',
        'acompanamiento': 'Set Up Acompañamiento',
        'gerencia': 'Gerencia',
        'produccion': 'Producción',
        'difusion': 'Difusión'
    }), []);

    // Función para generar los items del checklist
    const generateChecklistItems = useCallback((selectedItems: { [key: string]: boolean }, allData: FormDataSection) => {
        const items: ChecklistItem[] = [];

        Object.entries(allData).forEach(([sectionId, data]: [string, FormDataItem[]]) => {
            data.forEach((item) => {
                if (selectedItems[item.id]) {
                    const sectionName = sectionMapping[sectionId as keyof typeof sectionMapping] || sectionId;

                    items.push({
                        id: item.id,
                        concept: item.concept,
                        section: sectionName,
                        sectionId: sectionId,
                        completed: false
                    });
                }
            });
        });

        const sectionOrder = ['estrategia', 'antropologicos', 'otros-estudios', 'acompanamiento', 'gerencia', 'produccion', 'difusion'];
        items.sort((a, b) => {
            const sectionIndexA = sectionOrder.indexOf(a.sectionId);
            const sectionIndexB = sectionOrder.indexOf(b.sectionId);

            if (sectionIndexA !== sectionIndexB) {
                return sectionIndexA - sectionIndexB;
            }

            return a.id.localeCompare(b.id);
        });

        setChecklistItems(items);
    }, [sectionMapping]);

    // Cargar usuarios disponibles
    useEffect(() => {
        const availableUsers = getAllUsers();
        setUsers(availableUsers);
    }, []);

    // Cargar datos iniciales desde location state o localStorage
    useEffect(() => {
        const state = location.state as LocationState;
        if (state && state.clientName) {
            setClientName(state.clientName);
        }

        if (!state || !state.selectedItems || !state.allData) {
            const savedItems = storage.getItem<{ [key: string]: boolean }>('selectedItems');
            const savedFormData = storage.getItem<FormDataSection>('formData');

            if (savedItems && savedFormData) {
                generateChecklistItems(savedItems, savedFormData);
            }
        } else {
            generateChecklistItems(state.selectedItems, state.allData);
        }
    }, [location, generateChecklistItems]);

    // Inicializar visibilidad y cargar estado de completado
    useEffect(() => {
        setIsVisible(true);

        const savedCompletedItems = storage.getItem<{ [key: string]: boolean }>('completedItems');
        if (savedCompletedItems) {
            setChecklistItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    completed: savedCompletedItems[item.id] || false
                }))
            );
        }
    }, []);

    // Guardar asignaciones cuando cambien
    useEffect(() => {
        storage.setItem('taskAssignments', taskAssignments);

        const completedItemsMap = checklistItems.reduce((acc, item) => {
            acc[item.id] = item.completed;
            return acc;
        }, {} as { [key: string]: boolean });

        storage.setItem('completedItems', completedItemsMap);
    }, [taskAssignments, checklistItems]);

    // Group items by section
    const groupedItems = useMemo(() => {
        return checklistItems.reduce((acc, item) => {
            if (!acc[item.section]) {
                acc[item.section] = [];
            }
            acc[item.section].push(item);
            return acc;
        }, {} as Record<string, ChecklistItem[]>);
    }, [checklistItems]);

    // Get sections in the correct order
    const orderedSections = useMemo(() => {
        return Object.keys(sectionMapping)
            .map(sectionId => sectionMapping[sectionId as keyof typeof sectionMapping])
            .filter(sectionName => groupedItems[sectionName] && groupedItems[sectionName].length > 0);
    }, [sectionMapping, groupedItems]);

    // Calculate progress
    const completedCount = checklistItems.filter(item => item.completed).length;
    const totalCount = checklistItems.length;

    // Functions
    const toggleItemCompletion = (itemId: string) => {
        const updatedItems = checklistItems.map(item =>
            item.id === itemId ? {
                ...item,
                completed: !item.completed
            } : item
        );

        setChecklistItems(updatedItems);

        const completedItemsMap = updatedItems.reduce((acc, item) => {
            acc[item.id] = item.completed;
            return acc;
        }, {} as { [key: string]: boolean });

        storage.setItem('completedItems', completedItemsMap);

        const assignedUserId = getFieldValue(itemId, 'assignedUser');
        if (assignedUserId) {
            const item = checklistItems.find(item => item.id === itemId);
            if (item) {
                const isCompleted = updatedItems.find(i => i.id === itemId)?.completed || false;

                const assignmentIndex = taskAssignments.findIndex(a => a.itemId === itemId);
                if (assignmentIndex >= 0) {
                    const updatedAssignments = [...taskAssignments];
                    updatedAssignments[assignmentIndex] = {
                        ...updatedAssignments[assignmentIndex],
                        completed: isCompleted
                    };
                    setTaskAssignments(updatedAssignments);
                    storage.setItem('taskAssignments', updatedAssignments);
                } else if (assignedUserId) {
                    const newAssignment: TaskAssignment = {
                        itemId,
                        userId: assignedUserId,
                        concept: item.concept,
                        section: item.section,
                        sectionId: item.sectionId,
                        dueDate: dueDates[itemId] || '',
                        completed: isCompleted
                    };

                    const newAssignments = [...taskAssignments, newAssignment];
                    setTaskAssignments(newAssignments);
                    storage.setItem('taskAssignments', newAssignments);
                }
            }
        }
    };

    const handleDeleteItem = (itemId: string) => {
        if (currentUser && hasPermission(currentUser, 'edit_checklist')) {
            setItemToDelete(itemId);
        } else {
            setShowAccessDeniedModal(true);
        }
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        setChecklistItems(prev => prev.filter(item => item.id !== itemToDelete));

        const updatedAssignments = taskAssignments.filter(assignment => assignment.itemId !== itemToDelete);
        setTaskAssignments(updatedAssignments);
        storage.setItem('taskAssignments', updatedAssignments);

        const completedItems = storage.getItem<{ [key: string]: boolean }>('completedItems') || {};
        delete completedItems[itemToDelete];
        storage.setItem('completedItems', completedItems);

        const updatedFieldValues = { ...fieldValues };
        Object.keys(updatedFieldValues).forEach(key => {
            if (key.startsWith(`${itemToDelete}-`)) {
                delete updatedFieldValues[key];
            }
        });

        setFieldValues(updatedFieldValues);
        storage.setItem('fieldValues', updatedFieldValues);

        setItemToDelete(null);
    };

    const openModal = (
        itemId: string,
        fieldName: string,
        fieldType: 'text' | 'number' | 'select' = 'text',
        selectOptions: { value: string; label: string }[] = []
    ) => {
        if (currentUser && hasPermission(currentUser, 'edit_checklist')) {
            const fieldKey = `${itemId}-${fieldName}`;
            const currentValue = fieldValues[fieldKey] || '';

            setModalState({
                isOpen: true,
                fieldName,
                fieldType,
                initialValue: currentValue,
                selectOptions,
                onSave: (value: string) => {
                    const updatedValues = {
                        ...fieldValues,
                        [fieldKey]: value
                    };
                    setFieldValues(updatedValues);
                    storage.setItem('fieldValues', updatedValues);
                }
            });
        } else {
            setShowAccessDeniedModal(true);
        }
    };

    const closeModal = () => {
        setModalState(prev => ({
            ...prev,
            isOpen: false
        }));
    };

    const getFieldValue = (itemId: string, fieldName: string) => {
        const fieldKey = `${itemId}-${fieldName}`;
        return fieldValues[fieldKey] || '';
    };

    const handleUserAssignment = (itemId: string, userId: string) => {
        const fieldKey = `${itemId}-assignedUser`;
        const item = checklistItems.find(item => item.id === itemId);

        if (currentUser && hasPermission(currentUser, 'assign_tasks')) {
            const updatedValues = {
                ...fieldValues,
                [fieldKey]: userId
            };
            setFieldValues(updatedValues);

            if (userId && item) {
                const existingAssignmentIndex = taskAssignments.findIndex(
                    assignment => assignment.itemId === itemId
                );

                if (existingAssignmentIndex >= 0) {
                    const updatedAssignments = [...taskAssignments];
                    updatedAssignments[existingAssignmentIndex] = {
                        ...updatedAssignments[existingAssignmentIndex],
                        userId: userId,
                        concept: item.concept,
                        section: item.section,
                        sectionId: item.sectionId,
                        completed: item.completed
                    };
                    setTaskAssignments(updatedAssignments);
                    storage.setItem('taskAssignments', updatedAssignments);
                } else {
                    const newAssignment = {
                        itemId,
                        userId,
                        concept: item.concept,
                        section: item.section,
                        sectionId: item.sectionId,
                        dueDate: dueDates[itemId] || '',
                        completed: item.completed
                    };

                    const newAssignments = [...taskAssignments, newAssignment];
                    setTaskAssignments(newAssignments);
                    storage.setItem('taskAssignments', newAssignments);
                }
            }

            storage.setItem('fieldValues', updatedValues);
        } else {
            setShowAccessDeniedModal(true);
        }
    };

    const handleDueDateChange = (itemId: string, date: string) => {
        const updatedDates = { ...dueDates, [itemId]: date };
        setDueDates(updatedDates);

        const assignmentIndex = taskAssignments.findIndex(a => a.itemId === itemId);
        if (assignmentIndex >= 0) {
            const updatedAssignments = [...taskAssignments];
            updatedAssignments[assignmentIndex].dueDate = date;
            setTaskAssignments(updatedAssignments);
            storage.setItem('taskAssignments', updatedAssignments);
        }

        storage.setItem('dueDates', updatedDates);
    };

    return {
        // State
        isVisible,
        clientName,
        checklistItems,
        users,
        itemToDelete,
        showLogoutDialog,
        showAccessDeniedModal,
        taskAssignments,
        dueDates,
        modalState,
        currentUser,
        groupedItems,
        orderedSections,
        completedCount,
        totalCount,

        // Setters
        setItemToDelete,
        setShowLogoutDialog,
        setShowAccessDeniedModal,

        // Functions
        toggleItemCompletion,
        handleDeleteItem,
        confirmDelete,
        openModal,
        closeModal,
        getFieldValue,
        handleUserAssignment,
        handleDueDateChange,
        hasPermission
    };
};
