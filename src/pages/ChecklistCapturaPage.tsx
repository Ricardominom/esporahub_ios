import React from 'react';
import { useChecklistLogic } from '@/components/ChecklistCaptura/useChecklistLogic';
import ChecklistHeader from '@/components/ChecklistCaptura/ChecklistHeader';
import ChecklistTableContainer from '@/components/ChecklistCaptura/ChecklistTableContainer';
import LogoutButton from '@/components/ChecklistCaptura/LogoutButton';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import AccessDeniedModal from '@/components/AccessDeniedModal';
import InputModal from '@/components/InputModal';
import { User } from '@/data/users';
import { storage } from '@/utils/storage';
import '@/styles/checklist-captura.css';
import '@/styles/input-modal.css';

const ChecklistCapturaPage: React.FC = () => {
  const {
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
  } = useChecklistLogic();

  // Get theme from body class
  const isDarkMode = document.body.classList.contains('dark-theme');

  // Wrapper function for hasPermission that handles null users
  const hasPermissionWrapper = (user: User | null, permission: string) => {
    return user ? hasPermission(user, permission) : false;
  };

  return (
    <div className={`checklist-captura-page ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <ChecklistHeader
        clientName={clientName}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      <LogoutButton
        showLogoutDialog={showLogoutDialog}
        setShowLogoutDialog={setShowLogoutDialog}
        taskAssignments={taskAssignments}
        isDarkMode={isDarkMode}
        storage={storage}
      />

      <div className={`checklist-content ${isVisible ? 'visible' : ''}`}>
        <ChecklistTableContainer
          orderedSections={orderedSections}
          groupedItems={groupedItems}
          users={users}
          dueDates={dueDates}
          currentUser={currentUser}
          hasPermission={hasPermissionWrapper}
          toggleItemCompletion={toggleItemCompletion}
          handleDeleteItem={handleDeleteItem}
          handleUserAssignment={handleUserAssignment}
          handleDueDateChange={handleDueDateChange}
          getFieldValue={getFieldValue}
          openModal={openModal}
        />
      </div>

      <InputModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={modalState.onSave}
        initialValue={modalState.initialValue}
        fieldName={modalState.fieldName}
        fieldType={modalState.fieldType}
        selectOptions={modalState.selectOptions}
      />

      <DeleteConfirmationModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        itemName={checklistItems.find(item => item.id === itemToDelete)?.concept || 'este elemento'}
      />

      <AccessDeniedModal
        isOpen={showAccessDeniedModal}
        onClose={() => setShowAccessDeniedModal(false)}
        featureName="Edición de Checklist"
      />
    </div>
  );
};

export default ChecklistCapturaPage;