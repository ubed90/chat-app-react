type BlockModalProps = {
    handleLeave: () => void;
    handleCancel: () => void;
}

const BlockModal: React.FC<BlockModalProps> = ({ handleCancel, handleLeave }) => {
  return (
    <div className="absolute inset-0 bg-black/45 z-10 flex justify-center items-center">
      <div
        style={{ width: 'min(90%, 40rem)' }}
        className="bg-slate-900 text-white shadow-lg shadow-white/10 py-6 px-6 rounded-xl flex flex-col"
      >
        <h6 className="text-2xl">
          Are you sure you want to leave ? <br />
          <span className="text-error">Call will be disconnected</span>
        </h6>
        <div className="divider my-2"></div>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="btn btn-outline text-white text-2xl rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleLeave}
            className="btn btn-error text-white text-2xl rounded-md"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockModal