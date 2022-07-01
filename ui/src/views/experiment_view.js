import React from 'react';
import { useSelector } from 'react-redux';

import { api_url } from '../config.js';
import { BlockView } from './block_view.js';
import RLMenu from './ui/menu.js';
import { RLJSONEditor } from './ui/json_edit.js';
import RLButton from './ui/button.js';
import { Bar } from './ui/bar.js';
import RLInput from './ui/input.js';
import RLTabs from './ui/tabs.js';
import { RLSpinner } from './ui/spinner.js';
import { classNames } from './ui/common.js';
import { RLTooltip } from './ui/tooltip.js';

/*
  assign object o to object n without overwriting existing properties of o.
 */
/*
const assign_keep_old = (o, n) => {
    if (o === null || o === undefined)
        return n;
    if (n === null || n === undefined)
        return o;                        
    Object.keys(n).forEach(param => {
    if (o[param] !== undefined)
        n[param] = o[param];
    });
    return n;
};
*/

export const ExperimentView = () => {
    const ctrl_state = useSelector((state) => state.reptilearn.ctrlState);
    const [selectedParamsIndex, setSelectedParamsIndex] = React.useState(0);
    /*
    const update_defaults = (override_blocks) => {
    fetch(exp_url + "/default_params")
        .then(res => res.json())
        .then(new_defaults => {
                if (new_defaults == null) {
                    setDefaultParams(null);
                    setDefaultBlocks(null);
                }
                else {                
                    const new_default_params = new_defaults.params === undefined ?
                          null : new_defaults.params;
                    const new_default_blocks = new_defaults.blocks === undefined ?
                          null : new_defaults.blocks;
                    
                    merge_params(new_default_params);
                    if (override_blocks ||
                        new_default_blocks.length === experimentBlocks.length ||
                        experimentBlocks.length === 0)
                        
                        merge_all_blocks(new_default_blocks);

                    setDefaultParams(new_default_params);
                    setDefaultBlocks(new_default_blocks);
                }
            });
    };
    */
    /*
    const merge_params = (new_defaults) => {
        setExperimentParams(assign_keep_old(experimentParams, new_defaults));
    };

    const merge_all_blocks = (new_defaults) => {
        const blocks = [];
        new_defaults.forEach((new_block, i) => {
            blocks.push(merge_block(new_block, i));
        });
        setExperimentBlocks(blocks);
    };*/

    /*
    const merge_block = (new_defaults, block_idx) => {
        const new_default_block = {...new_defaults};
        const experiment_block = (experimentBlocks.length > block_idx) ?
              {...experimentBlocks[block_idx]} : null;

        return assign_keep_old(experiment_block, new_default_block);        
    };
    */

    const reset_params = () => {
        fetch(api_url + "/session/params/update", { method: "POST" });
    };

    const reset_all_blocks = () => {
        fetch(api_url + "/session/blocks/update", { method: "POST" });
    };

    const run_experiment = () => {
        fetch(api_url + "/session/run");
    };

    const stop_experiment = () => {
        fetch(api_url + "/session/stop");
    };

    const on_params_changed = (updatedContent) => {
        fetch(api_url + "/session/params/update", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedContent.json)
        });
    };

    const next_block = () => {
        fetch(api_url + "/session/next_block");
    };

    const next_trial = () => {
        fetch(api_url + "/session/next_trial");
    };

    const reset_phase = () => {
        fetch(api_url + "/session/reset_phase");
    };

    const run_action = (label) => {
        fetch(api_url + `/run_action/${label}`);
    };

    if (!ctrl_state)
        return null;

    const is_running = ctrl_state.session ? ctrl_state.session.is_running : false;
    const session = ctrl_state.session;
    const cur_block = ctrl_state?.session?.cur_block;

    const session_title = (() => {
        if (!session) return "Session";

        const st = new Date(session.start_time);
        return `${session.id} (${ctrl_state.session.experiment} ${st.toLocaleString()})`;
    })();


    const action_items = ctrl_state?.session?.actions?.map(a => (
        <RLMenu.ButtonItem key={a} onClick={() => run_action(a)}>
            {a}
        </RLMenu.ButtonItem>
    ));

    const actions_view = session?.actions && session.actions.length > 0
        ? (
            <RLMenu title="Actions" align="right" button={RLMenu.BarButton}>
                {action_items}
            </RLMenu>
        ) : null;

    const phase_toolbar = !session ? null :
        <Bar colors="bg-gray-50 border-gray-300">
            {session
                ? (is_running
                    ? <RLTooltip content="Stop experiment"><RLButton.BarButton onClick={stop_experiment} icon="stop" /></RLTooltip>
                    : <RLTooltip content="Run experiment"><RLButton.BarButton onClick={run_experiment} icon="play" /></RLTooltip>)
                : null
            }
            <div className='flex items-center px-1 h-[22px]'>Block:</div>
            <RLInput.Text readOnly value={session.cur_block + 1} size="3" className="h-[22px]" />
            <RLButton.BarButton onClick={next_block} icon="add" />
            <div className='flex items-center px-1 h-[22px]'>Trial:</div>
            <RLInput.Text readOnly value={session.cur_trial + 1} size="3" className="h-[22px]" />
            <RLButton.BarButton onClick={next_trial} icon="add" />
            <RLButton.BarButton onClick={reset_phase} icon="undo" className="mr-auto" />
            {actions_view}
        </Bar>;

    if (session?.blocks && selectedParamsIndex > session.blocks.length) {
        setSelectedParamsIndex(session.blocks.length);
    }

    const paramsTab = session && {
        title: "Params",
        panel: (
            <div className="flex flex-col h-full overflow-hidden">
                <Bar title="Parameters" colors="bg-gray-200" border="none">
                    <RLButton.BarButton onClick={reset_params} disabled={is_running} text="Reset" />
                    <RLButton.BarButton onClick={reset_all_blocks} disabled={is_running} text="Reset blocks" />
                </Bar>
                <RLJSONEditor
                    content={{ json: session.params }}
                    onChange={on_params_changed}
                    className="flex-grow overflow-y-scroll"
                    readOnly={is_running}
                    mainMenuBar={false}
                    navigationBar={false} />
            </div>
        ),
    };

    const blockTabs = session && session.blocks.map((_, idx) => ({
        title: <span className={classNames((cur_block === idx && session.blocks.length > 1) ? "text-green-600" : "")}>{idx === 0 ? "Block 1" : idx + 1}</span>,
        panel: <BlockView idx={idx} />
    }));

    const params = session && ((session?.params && session?.blocks) ? (
        <RLTabs
            onChange={setSelectedParamsIndex}
            selectedIndex={selectedParamsIndex}
            className="overflow-hidden mt-px"
            panelClassName="flex-col flex-1 overflow-hidden"
            tabs={[paramsTab, ...blockTabs]} />
    ) : <RLSpinner>Loading...</RLSpinner>)


    return (
        <div className="flex flex-col h-full">
            <Bar title={session_title} />
            {phase_toolbar}
            {params}
        </div>
    );
};
