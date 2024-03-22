const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
const easymidi = require('easymidi');
const Sequencer = require('./Sequencer'); // Ensure this path is correct
const { basicSequence } = require('./SequenceModule');
console.log('Imported sequence:', basicSequence);

function selectMIDIPort(isInput) {
    const ports = isInput ? easymidi.getInputs() : easymidi.getOutputs();
    console.log(isInput ? 'Available MIDI Input Ports:' : 'Available MIDI Output Ports:');
    ports.forEach((port, index) => console.log(`${index}: ${port}`));

    readline.question(`Select MIDI ${isInput ? 'Input' : 'Output'} Port by number: `, (number) => {
        const portIndex = parseInt(number, 10);
        if (isNaN(portIndex) || portIndex < 0 || portIndex >= ports.length) {
            console.log('Invalid selection. Exiting...');
            process.exit(1);
        }

        if (isInput) {
            receiveMIDIFromPort(ports[portIndex]);
        } else {
            sendMIDIToPort(ports[portIndex]);
        }
    });
}

function receiveMIDIFromPort(portName) {
    const input = new easymidi.Input(portName);
    console.log(`Listening to MIDI input from ${portName}...`);
    input.on('noteon', (msg) => console.log('Note on:', msg));
    input.on('noteoff', (msg) => console.log('Note off:', msg));
    // Additional listeners as needed
}


function sendMIDIToPort(portName) {
    console.log(`Creating output for port: ${portName}`);
    const output = new easymidi.Output(portName);
    console.log(`Output created for ${portName}`);
    
    const sequencer = new Sequencer(output, 120); // Initialize the sequencer with the selected MIDI output
    
    // Logging the imported sequence to verify its content immediately before setting it
    console.log('Setting sequence:', basicSequence);
    sequencer.setSequence(basicSequence); // Set the sequence
    
    console.log(`Sequencer initialized for ${portName}. Press 'p' to play/stop the sequence, 'q' to quit.`);
    
    readline.on('line', (line) => {
        switch (line.trim()) {
            case 'p':
                // Toggle play/stop based on the sequencer's current state
                if (sequencer.isPlaying) {
                    console.log('Stopping sequence.');
                    sequencer.stopSequence();
                } else {
                    console.log('Playing sequence.');
                    sequencer.playSequence();
                }
                break;
            case 'q':
                console.log('Exiting...');
                sequencer.stopSequence(); // Ensure the sequence is stopped
                output.close(); // Close the MIDI output port
                readline.close(); // Close the readline interface
                process.exit(0);
                break;
            default:
                console.log("Unknown command. Use 'p' to play/stop the sequence, 'q' to quit.");
        }
    });
}

readline.question('Choose mode - Input (i) or Output (o): ', (mode) => {
    switch (mode.toLowerCase()) {
        case 'i':
            selectMIDIPort(true);
            break;
        case 'o':
            selectMIDIPort(false);
            break;
        default:
            console.log('Invalid mode selected. Exiting...');
            readline.close();
            process.exit(1);
    }
});
