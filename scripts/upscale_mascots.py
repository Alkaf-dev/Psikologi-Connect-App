import os
import glob
import shutil
from PIL import Image, ImageSequence

MASCOT_DIR = r'c:\project\psikologiconnect-app\public\images\psychology\mascot'
BACKUP_DIR = os.path.join(MASCOT_DIR, 'backup_lowres')

os.makedirs(BACKUP_DIR, exist_ok=True)

gif_files = glob.glob(os.path.join(MASCOT_DIR, '*.gif'))
print(f"Found {len(gif_files)} GIF files to upscale to HD (2x).")

for gif_path in gif_files:
    fname = os.path.basename(gif_path)
    backup_path = os.path.join(BACKUP_DIR, fname)
    if not os.path.exists(backup_path):
        shutil.copy2(gif_path, backup_path)
    
    im = Image.open(backup_path)
    orig_w, orig_h = im.size
    
    # Scale 2x (for berjalan-toggle 56x100 -> 168x300 for super-crisp launcher, others 2x)
    scale = 3 if 'toggle' in fname else 2
    new_w = orig_w * scale
    new_h = orig_h * scale
    
    duration = im.info.get('duration', 70)
    loop = im.info.get('loop', 0)
    trans = im.info.get('transparency', 0)
    disposal = im.info.get('disposal', 2)
    
    print(f"Processing {fname}: ({orig_w}x{orig_h}) -> ({new_w}x{new_h}) [{im.n_frames} frames]...")
    
    frames = []
    for frame in ImageSequence.Iterator(im):
        f = frame.copy().resize((new_w, new_h), Image.Resampling.LANCZOS)
        f.info['transparency'] = trans
        f.info['duration'] = duration
        f.info['disposal'] = disposal
        frames.append(f)
        
    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=loop,
        transparency=trans,
        disposal=disposal,
        optimize=True
    )
    
    new_size_kb = os.path.getsize(gif_path) / 1024
    print(f"  -> Saved {fname}: {new_size_kb:.1f} KB")

# Also upscale poster PNGs
poster_files = glob.glob(os.path.join(MASCOT_DIR, '*-poster.png'))
print(f"\nProcessing {len(poster_files)} poster PNGs...")
for poster_path in poster_files:
    fname = os.path.basename(poster_path)
    backup_path = os.path.join(BACKUP_DIR, fname)
    if not os.path.exists(backup_path):
        shutil.copy2(poster_path, backup_path)
        
    im = Image.open(backup_path)
    orig_w, orig_h = im.size
    scale = 3 if 'toggle' in fname else 2
    new_w = orig_w * scale
    new_h = orig_h * scale
    
    r = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    r.save(poster_path, optimize=True)
    print(f"  -> Saved {fname}: ({orig_w}x{orig_h}) -> ({new_w}x{new_h})")

print("\nAll mascots successfully upscaled to HD!")
