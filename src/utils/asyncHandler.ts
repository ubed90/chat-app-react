type AsyncFunction = () => Promise<void>;

const asyncHandler = async <O>(
  fn: AsyncFunction,
  onSuccess: () => void | Promise<O>,
  onError: () => void | Promise<void>
) => {
  try {
    await fn();
    await onSuccess();
  } catch (error) {
    console.log(error);
    onError();
  }
};

export default asyncHandler;