// young-streamers/src/lib/webrtc.ts

import { db } from "@/lib/firebaseConfig";
import { ref, set, onValue, remove } from "firebase/database";

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }, // STUN Server
  ],
};

export class WebRTCConnection {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private userId: string;
  private streamId: string;

  constructor(userId: string, streamId: string) {
    this.peerConnection = new RTCPeerConnection(servers);
    this.userId = userId;
    this.streamId = streamId;
  }

  async startStreaming(localStream: MediaStream) {
    this.localStream = localStream;
    localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, localStream);
    });

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    set(ref(db, `streams/${this.streamId}/offer`), {
      type: offer.type,
      sdp: offer.sdp,
    });

    onValue(ref(db, `streams/${this.streamId}/answer`), (snapshot) => {
      const answer = snapshot.val();
      if (answer) {
        this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        set(
          ref(db, `streams/${this.streamId}/candidates/${this.userId}`),
          event.candidate
        );
      }
    };
  }

  async watchStream(setRemoteStream: (stream: MediaStream) => void) {
    this.remoteStream = new MediaStream();
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
      setRemoteStream(this.remoteStream);
    };

    onValue(ref(db, `streams/${this.streamId}/offer`), async (snapshot) => {
      const offer = snapshot.val();
      if (offer) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        set(ref(db, `streams/${this.streamId}/answer`), {
          type: answer.type,
          sdp: answer.sdp,
        });
      }
    });

    onValue(ref(db, `streams/${this.streamId}/candidates`), (snapshot) => {
      const candidates = snapshot.val();
      if (candidates) {
        Object.values(candidates).forEach((candidate) => {
          this.peerConnection.addIceCandidate(
            new RTCIceCandidate(candidate as RTCIceCandidateInit)
          );
        });
      }
    });
  }

  closeConnection() {
    this.peerConnection.close();
    this.localStream?.getTracks().forEach((track) => track.stop());
    remove(ref(db, `streams/${this.streamId}`));
  }
}
