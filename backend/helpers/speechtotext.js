import axios from "axios";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Tell ffmpeg where to find the binary
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convert audio file to mono 16kHz WAV format required by Google Speech-to-Text
 * @param {string} input - Input file path
 * @param {string} output - Output file path
 * @returns {Promise<string>} - Resolves with output file path
 */
function convertToMono(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioChannels(1)         // force mono
      .audioFrequency(16000)    // resample to 16kHz
      .audioCodec("pcm_s16le")  // LINEAR16 format
      .format("wav")
      .on("end", () => resolve(output))
      .on("error", reject)
      .save(output);
  });
}

/**
 * Extract and format transcript from Google Speech-to-Text API response
 * @param {Object} apiResponse - Raw Google API response
 * @returns {Object} - Formatted transcript data
 */
function formatTranscriptResponse(apiResponse) {
  if (!apiResponse.results || apiResponse.results.length === 0) {
    return {
      transcript: "",
      confidence: 0,
      duration: "0s",
      segments: []
    };
  }

  // Combine all transcript segments
  const segments = apiResponse.results.map(result => {
    const alternative = result.alternatives[0];
    return {
      text: alternative.transcript.trim(),
      confidence: alternative.confidence || 0,
      endTime: result.resultEndTime || "0s"
    };
  });

  // Create full transcript
  const fullTranscript = segments
    .map(segment => segment.text)
    .join(" ")
    .trim();

  // Calculate average confidence
  const avgConfidence = segments.reduce((sum, segment) => sum + segment.confidence, 0) / segments.length;

  return {
    transcript: fullTranscript,
    confidence: avgConfidence,
    duration: apiResponse.totalBilledTime || "0s",
    segments: segments,
    requestId: apiResponse.requestId
  };
}

/**
 * Convert audio file to text using Google Speech-to-Text API
 * @param {string} audioFilePath - Path to the audio file
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Formatted transcript result
 */
export async function speechToText(audioFilePath, options = {}) {
  const {
    languageCode = "en-US",
    skipConversion = false,
    keepProcessedFile = true
  } = options;

  try {
    // Validate API key
    const API_KEY = process.env.GOOGLE_SPEECH_API_KEY || "AIzaSyB_dZ2CUK3PpdpbjS7gdaQ6YWTSRWhgvZE";
    if (!API_KEY) {
      throw new Error('Google Speech API key not found in environment variables');
    }

    // Validate input file
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    let processedFilePath = audioFilePath;

    // Convert to mono if needed (unless explicitly skipped)
    if (!skipConversion) {
      const fileExt = path.extname(audioFilePath);
      const fileName = path.basename(audioFilePath, fileExt);
      const fileDir = path.dirname(audioFilePath);
      processedFilePath = path.join(fileDir, `${fileName}_processed.wav`);

      // Check if processed file already exists
      if (fs.existsSync(processedFilePath)) {
        console.log("✅ Processed file already exists, skipping conversion...");
      } else {
        console.log("🎵 Converting audio to mono 16kHz format...");
        await convertToMono(audioFilePath, processedFilePath);
        console.log("✅ Audio conversion completed");
      }
    }

    // Read and encode audio file
    console.log("📂 Reading audio file...");
    const audioBytes = fs.readFileSync(processedFilePath).toString("base64");

    // Prepare API request
    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;
    const requestData = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false
      },
      audio: {
        content: audioBytes,
      },
    };

    // Make API request
    console.log("📡 Sending request to Google Speech-to-Text API...");
    const response = await axios.post(url, requestData, {
      headers: { "Content-Type": "application/json" },
    });

    // Format response
    const formattedResult = formatTranscriptResponse(response.data);

    // Cleanup processed file if requested
    if (!keepProcessedFile && processedFilePath !== audioFilePath && fs.existsSync(processedFilePath)) {
      fs.unlinkSync(processedFilePath);
      console.log("🗑️ Cleaned up processed audio file");
    }

    console.log("✅ Speech-to-text conversion completed");
    return {
      success: true,
      data: formattedResult,
      rawResponse: response.data
    };

  } catch (error) {
    console.error("❌ Speech-to-text conversion failed:", error.message);
    
    // Handle specific API errors
    if (error.response) {
      const apiError = error.response.data;
      return {
        success: false,
        error: apiError.error?.message || 'API request failed',
        details: apiError
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test function for backwards compatibility
 * @deprecated Use speechToText function instead
 */
async function testSpeechToText() {
  const inputFile = "sample.wav";
  
  if (!fs.existsSync(inputFile)) {
    console.error("❌ Test file 'sample.wav' not found");
    return;
  }

  console.log("🧪 Running speech-to-text test...");
  const result = await speechToText(inputFile);
  
  if (result.success) {
    console.log("✅ Test completed successfully:");
    console.log("Transcript:", result.data.transcript);
    console.log("Confidence:", result.data.confidence);
    console.log("Duration:", result.data.duration);
  } else {
    console.error("❌ Test failed:", result.error);
  }
}

// Export both named function and default for flexibility
export default speechToText;

// Run test if file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSpeechToText();
}
