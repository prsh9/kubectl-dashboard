'use strict';


export function extractContainterNames(podSpec) {
	var containerNames = {
		container: [],
		initContainer: []
	};
	
	if(podSpec) {
		podSpec.spec.containers.forEach(element => {
			containerNames.container.push(element.name);
		});
	}

	if(podSpec.spec.initContainers) {
		podSpec.spec.initContainers.forEach(element => {
			containerNames.initContainer.push(element.name);
		});
	}
	return containerNames;
}


export class PodSpec {
	constructor(podUid, podName, podNamespace) {
		this.podUid = podUid,
		this.podName = podName,
		this.podNamespace = podNamespace
	}
}

export class ConsoleData extends PodSpec {
	constructor(podUid, podName, podNamespace, shellType) {
		super(podUid, podName, podNamespace)
		this.shellType = shellType
	}
}

export class LogData extends PodSpec {
	constructor(podUid, podName, podNamespace, containerNames, initContainerNames) {
		super(podUid, podName, podNamespace)
		this.containerNames = containerNames;
		this.initContainerNames = initContainerNames;
	}
}
