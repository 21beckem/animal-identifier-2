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
import { Show } from 'solid-js';
import './style.css';
export default function LoadingSpinner(props) {
	const sizeClass = `spinner--${props.size || 'md'}`;

	return (
		<>
			<div class={`spinner-dimmer ${props.show === false ? 'hidden' : ''}`}></div>
			<div class={`spinner ${sizeClass} ${props.class || ''} ${props.show === false ? 'hidden' : ''}`}>
				<div class="spinner__ring"></div>
			</div>
		</>
	);
}
