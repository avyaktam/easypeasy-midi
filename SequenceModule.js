// SequenceModule.js
// Assuming a tempo of 120 BPM, and you want durations that 'feel' similar to your original values in ms
const basicSequence = [
    { note: 60, velocity: 100, duration: 0.5 }, // C4, half a beat
    { note: 64, velocity: 75, duration: 1 }, // E4, one beat
    { note: 67, velocity: 89, duration: 0.25 }, // G4, a quarter of a beat
    { note: 64, velocity: 100, duration: 0.25 },
    { note: 67, velocity: 90, duration: 0.125 },
    { note: 71, velocity: 79, duration: 2 }, // Two beats
    { note: 69, velocity: 90, duration: 0.25 },
    { note: 49, velocity: 80, duration: 1 },
];


// Export the sequence
module.exports = { basicSequence };
