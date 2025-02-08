import sys
import whisper
import torch
import warnings
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

warnings.filterwarnings("ignore", category=UserWarning, message="FP16 is not supported on CPU; using FP32 instead")
warnings.filterwarnings("ignore", category=FutureWarning, message="You are using `torch.load` with `weights_only=False`")
warnings.filterwarnings("ignore", category=UserWarning, message="Performing inference on CPU when CUDA is available")

def transcribe(path, model, device):
    # Отключаем вывод
    sys.stderr = open(os.devnull, 'w')

    model = whisper.load_model(model).to(device)

    # Включаем вывод обратно
    sys.stderr = sys.__stderr__

    result = model.transcribe(path)
    return result['text']

if __name__ == '__main__':
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    path = sys.argv[1]
    model = sys.argv[2]
    text = transcribe(path, model, device)
    print(text)