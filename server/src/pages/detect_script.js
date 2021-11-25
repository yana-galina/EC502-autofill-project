export function detect_script() {
    var isOutOfViewport = function (elem) {

        // Get element's bounding
        var bounding = elem.getBoundingClientRect();

        // Check if it's out of the viewport on each side
        var out = {};
        out.top = bounding.top < 0;
        out.left = bounding.left < 0;
        out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
        out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
        out.any = out.top || out.left || out.bottom || out.right;
        out.all = out.top && out.left && out.bottom && out.right;

        return out;

    };
    function dfs(document) {
        if (!document.children) return;
        let children = document.children;
        for (let child of children) {
            if (child.hidden) {
                child.hidden = false;
                child.style.backgroundColor = "red";
            }
            if (child.getAttribute('hidden')) {
                child.setAttribute('hidden') = false;
                child.style.backgroundColor = "red";
            }
            if (child.style['display'] == 'none') {
                child.style['display'] = 'initial';
                child.style.backgroundColor = "red";
            }
            var oov = isOutOfViewport(child);
            if (oov.any) {
                child.style['margin'] = 0;
            }

            dfs(child);
        }
    }
    document.addEventListener('DOMContentLoaded', (event) => {
        let forms = document.getElementsByTagName('form');
        for (let form of forms) {
            dfs(form);
        }
    });

}