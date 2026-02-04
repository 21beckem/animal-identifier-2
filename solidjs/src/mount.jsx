import { render } from 'solid-js/web';
import 'solid-devtools';

export default function mount(App, rootId='root') {
    const root = document.getElementById(rootId);
    
    if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
        throw new Error(
            'Root element not found. Did you forget to add it to your index.html?',
        );
    }
    render(() => <App />, root);
}