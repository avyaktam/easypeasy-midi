class Sequencer {
    constructor(output, tempo = 120) {
        this.output = output;
        this.sequence = [];
        this.isPlaying = false;
        this.tempo = tempo;
        this.currentNoteIndex = 0;
        this.timeoutID = null;
    }
    startMIDIClock() {
        console.log('Starting MIDI Clock...');
        const bpm = this.tempo;
        const ppqnInterval = (60 / bpm) * 1000 / 24; // Calculate interval in ms
    
        this.clockInterval = setInterval(() => {
            this.output.send('clock');
        }, ppqnInterval);
    }
    
    stopMIDIClock() {
        if (this.clockInterval) {
            console.log('Stopping MIDI Clock...');
            clearInterval(this.clockInterval);
        }
    }
    setTempo(newTempo) {
        this.tempo = newTempo;
        console.log(`Tempo set to ${newTempo}.`);
        if (this.isPlaying) {
            this.adjustSequenceTiming();
        }
    }

    adjustSequenceTiming() {
        clearTimeout(this.timeoutID);
        // Restart sequence from the current note index instead of stopping
        console.log('Adjusting sequence timing...');
        this.playSequenceFromCurrentNote();
    }

    convertDurationToMs(duration) {
        return (duration * 60000) / this.tempo;
    }

    setSequence(sequence) {
        this.sequence = sequence.map(note => ({
            ...note,
            originalDuration: note.duration,
        }));
        console.log('Sequence set.');
        this.currentNoteIndex = 0;
    }
    playSequence() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            console.log('Playing sequence...');
            this.startMIDIClock(); // Start MIDI clock
            this.playSequenceFromCurrentNote();
        }
    }
    
    playSequenceFromCurrentNote() {
        if (this.currentNoteIndex < this.sequence.length) {
            this.playNoteAtIndex(this.currentNoteIndex);
        } else {
            console.log('End of sequence reached. Looping...');
            this.currentNoteIndex = 0; // Reset index to loop the sequence
            this.playSequenceFromCurrentNote(); // Continue playing from the start
        }
    }

    playNoteAtIndex(index) {
        console.log(`playNoteAtIndex called with index: ${index}`);
        if (index >= this.sequence.length) {
            console.log("Reached end of sequence, stopping.");
            this.stopSequence();
            return;
        }
    
        const note = this.sequence[index];
        console.log(`Playing note: ${note.note}, Index: ${index}, Duration: ${note.duration} beats`);
        console.log(`Playing note: ${note.note}, Velocity: ${note.velocity}, Index: ${index}`);
        // Send "note on"
        this.output.send('noteon', { note: note.note, velocity: note.velocity, channel: 0 });

        // Calculate duration in milliseconds
        const durationMs = this.convertDurationToMs(note.originalDuration);
        
        // Wait for the duration of the note before sending "note off"
        setTimeout(() => {
            this.output.send('noteoff', { note: note.note, velocity: note.velocity, channel: 0 });
            // Advance to the next note after a short delay to simulate note separation
            setTimeout(() => {
                this.currentNoteIndex++;
                this.playSequenceFromCurrentNote();
            }, 10); // Small delay between notes
        }, durationMs);
    }
    playImmediateNote() {
        console.log('Playing immediate note from sequencer.');
        this.output.send('noteon', { note: 72, velocity: 100, channel: 0 });
        setTimeout(() => {
            this.output.send('noteoff', { note: 72, channel: 0 });
            console.log('Immediate note off from sequencer.');
        }, 1000);
    }
    // Ensure stopSequence correctly handles the ending of the sequence
    stopSequence() {
        if (this.isPlaying) {
            console.log('Stopping sequence...');
            clearTimeout(this.timeoutID);
            this.stopMIDIClock();
            this.isPlaying = false;
            this.currentNoteIndex = 0;

            // Ensure the last note is turned off
            if (this.sequence.length > 0 && this.currentNoteIndex < this.sequence.length) {
                const lastNote = this.sequence[this.currentNoteIndex];
                this.output.send('noteoff', { note: lastNote.note, velocity: lastNote.velocity, channel: 0 });
            }
        }
    }
}

module.exports = Sequencer;
