/**
 * Loading Spinner Component
 *
 * Animated spinner for async operations (form submission, data fetching).
 * Used in forms during submit and on pages during data load.
 */

/**
 * @component LoadingSpinner - Animated loading indicator
 * @param {Object} props
 * @param {string} [props.class] - Additional CSS classes
 * @param {string} [props.size] - Size: 'sm', 'md', 'lg' (default: 'md')
 * @returns {JSX.Element}
 */
export default function LoadingSpinner(props) {
	const sizeClass = `spinner--${props.size || 'md'}`;

	return (
		<div class={`spinner ${sizeClass} ${props.class || ''}`}>
			<div class="spinner__ring"></div>
		</div>
	);
}
