export const NAME_MAX_LENGTH = 50;
export const MESSAGE_MAX_LENGTH = 500;

/**
 * Validates a candidate post. Mirrors the constraints enforced again
 * server-side (database CHECK constraints + the submit-post Edge
 * Function) — this copy exists purely so the form can give the user
 * instant, specific feedback instead of waiting on a round trip.
 */
export function validatePost({ name, message }) {
  const errors = {};

  const trimmedName = name.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName) {
    errors.name = 'Please enter your name.';
  } else if (trimmedName.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be ${NAME_MAX_LENGTH} characters or less.`;
  }

  if (!trimmedMessage) {
    errors.message = 'Please enter a message.';
  } else if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Message must be ${MESSAGE_MAX_LENGTH} characters or less.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
