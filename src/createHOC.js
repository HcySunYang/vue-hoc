import { createRenderFnc } from './createRenderFn';
import assign from './assign';
import Vue from 'vue';

const defaultStrategy = (parent, child) => child;

const normalizeProps = (props) => {
  if (!props){
    return {};
  }
  if (Array.isArray(props)){
    const obj = {};
    props.forEach((key) => {
      if (typeof key === 'string'){
        obj[key] = {};
      }
    });
    return obj;
  }
  return assign({}, props);
};

export const createHOC = (Component, options, renderOptions) => {
  const hoc = {
    props: normalizeProps((typeof Component === 'function')
      ? Component.options.props
      : Component.props),
    mixins: [],
    name: `${Component.name || 'Anonymous'}HOC`,
    render: createRenderFnc(renderOptions),
  };
  if (options){
    Object.keys(options).forEach((key) => {
      const child = options && options[key];
      const parent = hoc[key];
      const strategy = Vue.config.optionMergeStrategies[key] || defaultStrategy;

      if (key === 'props'){
        hoc[key] = strategy(parent, normalizeProps(child));
      }else{
        hoc[key] = strategy(parent, child);
      }
    });
  }

  hoc.mixins && hoc.mixins.push({
    created(){
      this.$createElement = this.$parent.$createElement;
    }
  });

  if (hoc.render && hoc.render.curried){
    hoc.render = hoc.render(Component);
  }

  return hoc;
};

export const createHOCc = (
  options,
  renderOptions,
) => {
  const curried = (Component) => createHOC(Component, options, renderOptions);
  curried.curried = true;
  return curried;
};

export default createHOC;
