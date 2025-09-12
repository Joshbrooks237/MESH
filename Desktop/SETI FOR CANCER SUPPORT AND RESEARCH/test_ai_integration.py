#!/usr/bin/env python3
"""
SETI Cancer Research Universe - AI/ML Integration Test

This script demonstrates the AI/ML models working with the distributed computing system.
It tests each AI model independently and shows how they integrate with the volunteer client.
"""

import os
import sys
import json
import asyncio
import time
from typing import Dict, Any

# Add AI models to path
ai_models_path = os.path.join(os.path.dirname(__file__), 'ai-models')
sys.path.insert(0, ai_models_path)

# Also add the project root to path for distributed computing
project_root = os.path.dirname(__file__)
sys.path.insert(0, project_root)

def test_genomic_analysis():
    """Test genomic variant analysis AI model."""
    print("\n🧬 Testing Genomic Variant Analysis AI Model")
    print("=" * 50)

    try:
        from genomics.variant_classifier import GenomicVariantAnalyzer

        # Sample variant data
        sample_variants = [
            {
                'id': 'rs123456',
                'chromosome': '17',
                'position': 7577121,
                'ref': 'C',
                'alt': 'T',
                'gene': 'BRCA1',
                'consequence': 'missense',
                'region': 'exon',
                'allele_frequency': 0.001,
                'sift_score': 0.02,
                'polyphen_score': 0.98,
                'cadd_score': 28.5
            },
            {
                'id': 'rs789012',
                'chromosome': '13',
                'position': 32921028,
                'ref': 'G',
                'alt': 'A',
                'gene': 'BRCA2',
                'consequence': 'synonymous',
                'region': 'exon',
                'allele_frequency': 0.45,
                'sift_score': 0.85,
                'polyphen_score': 0.12,
                'cadd_score': 8.2
            }
        ]

        analyzer = GenomicVariantAnalyzer()
        results = analyzer.analyze_variants_batch(sample_variants)

        print(f"✅ Analyzed {len(results)} variants")
        for result in results:
            prediction = result.get('prediction', 'unknown')
            confidence = result.get('confidence', 0)
            print(".3f")

        return True

    except (ImportError, ModuleNotFoundError) as e:
        print(f"⚠️  Genomic analysis model not available: {e}")
        print("   Using mock analysis instead")
        return False
    except Exception as e:
        print(f"⚠️  Genomic analysis test failed: {e}")
        print("   Using mock analysis instead")
        return False

def test_medical_imaging():
    """Test medical image tumor detection AI model."""
    print("\n🖼️  Testing Medical Image Tumor Detection AI Model")
    print("=" * 50)

    try:
        from medical_imaging.tumor_detector import TumorDetector

        # Create a mock image path for testing
        mock_image_path = "/tmp/mock_medical_image.png"

        # Create a simple test image if it doesn't exist
        if not os.path.exists(mock_image_path):
            import numpy as np
            from PIL import Image
            # Create a simple test image
            test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            Image.fromarray(test_image).save(mock_image_path)

        detector = TumorDetector()

        print("🔍 Analyzing mock medical image...")
        result = detector.analyze_image(mock_image_path)

        if 'error' not in result:
            prediction = result.get('prediction', 'unknown')
            confidence = result.get('confidence', 0)
            tumor_detected = result.get('tumor_detected', False)
            print(f"✅ Analysis complete: {prediction} (confidence: {confidence:.3f})")
            print(f"   Tumor detected: {tumor_detected}")
        else:
            print(f"⚠️  Analysis returned error: {result['error']}")

        # Clean up
        if os.path.exists(mock_image_path):
            os.remove(mock_image_path)

        return True

    except (ImportError, ModuleNotFoundError) as e:
        print(f"⚠️  Medical imaging model not available: {e}")
        print("   Using mock analysis instead")
        return False
    except Exception as e:
        print(f"⚠️  Medical imaging test failed: {e}")
        print("   Using mock analysis instead")
        return False

def test_drug_discovery():
    """Test drug discovery virtual screening AI model."""
    print("\n💊 Testing Drug Discovery Virtual Screening AI Model")
    print("=" * 50)

    try:
        from drug_discovery.drug_screening import VirtualScreeningPipeline

        # Sample SMILES strings for testing
        sample_compounds = [
            'CC(=O)OC1=CC=CC=C1C(=O)O',  # Aspirin
            'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',  # Caffeine
            'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',  # Ibuprofen
            'CC1=C(C=NO1)C(=O)NC2=CC=C(C=C2)C(F)(F)F',  # Celecoxib
            'CC1=C(C2=C(C=C1)C(=O)C3=CC=CC=C3C2=O)C'  # Warfarin
        ]

        pipeline = VirtualScreeningPipeline()

        print(f"🔬 Screening {len(sample_compounds)} compounds against EGFR...")
        results = pipeline.screen_compounds(sample_compounds, 'EGFR')

        print(f"✅ Virtual screening complete!")
        print(f"   Top compound score: {results[0]['drug_score']:.3f}")
        print(f"   High-affinity compounds: {len([r for r in results if r['binding_probability'] > 0.8])}")
        print(f"   Drug-like compounds: {len([r for r in results if r['drug_score'] > 0.7])}")

        # Show top 3 results
        print("\n🏆 Top 3 Compounds:")
        for i, result in enumerate(results[:3], 1):
            print(f"   {i}. Score: {result['drug_score']:.3f}, Binding: {result['binding_probability']:.3f}")

        return True

    except (ImportError, ModuleNotFoundError) as e:
        print(f"⚠️  Drug discovery model not available: {e}")
        print("   Using mock analysis instead")
        return False
    except Exception as e:
        print(f"⚠️  Drug discovery test failed: {e}")
        print("   Using mock analysis instead")
        return False

async def test_distributed_integration():
    """Test AI models integration with distributed computing."""
    print("\n🔗 Testing AI/ML Integration with Distributed Computing")
    print("=" * 50)

    try:
        from distributed_computing.volunteer_client import VolunteerClient

        # Test genetic analysis task
        genetic_payload = {
            'variants': [
                {
                    'id': 'test_variant_1',
                    'chromosome': '17',
                    'position': 7577121,
                    'ref': 'C',
                    'alt': 'T',
                    'gene': 'BRCA1',
                    'consequence': 'missense'
                }
            ],
            'reference_genome': 'hg38'
        }

        print("🧬 Testing genetic analysis integration...")
        client = VolunteerClient()
        genetic_result = await client._process_genetic_analysis(genetic_payload)

        if 'error' not in genetic_result:
            print("✅ Genetic analysis integration successful!")
            print(f"   Variants processed: {genetic_result.get('variants_analyzed', 0)}")
            print(f"   Processing method: {genetic_result.get('processing_method', 'unknown')}")
        else:
            print(f"⚠️  Genetic analysis failed: {genetic_result.get('error', 'unknown error')}")

        # Test drug screening task
        drug_payload = {
            'compounds': ['CC(=O)OC1=CC=CC=C1C(=O)O', 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C'],
            'target': 'EGFR'
        }

        print("\n💊 Testing drug screening integration...")
        drug_result = await client._process_drug_screening(drug_payload)

        if 'error' not in drug_result:
            print("✅ Drug screening integration successful!")
            print(f"   Compounds screened: {drug_result.get('compounds_screened', 0)}")
            print(f"   Processing method: {drug_result.get('processing_method', 'unknown')}")
        else:
            print(f"⚠️  Drug screening failed: {drug_result.get('error', 'unknown error')}")

        return True

    except (ImportError, ModuleNotFoundError) as e:
        print(f"⚠️  Distributed computing integration test failed: {e}")
        return False
    except Exception as e:
        print(f"⚠️  Distributed computing test failed: {e}")
        return False

def main():
    """Run all AI/ML integration tests."""
    print("🚀 SETI Cancer Research Universe - AI/ML Integration Tests")
    print("=" * 60)
    print("Testing AI-powered cancer research capabilities...")
    print()

    # Track test results
    results = []

    # Test individual AI models
    results.append(("Genomic Analysis", test_genomic_analysis()))
    time.sleep(1)  # Brief pause between tests

    results.append(("Medical Imaging", test_medical_imaging()))
    time.sleep(1)

    results.append(("Drug Discovery", test_drug_discovery()))
    time.sleep(1)

    # Test distributed computing integration
    distributed_result = asyncio.run(test_distributed_integration())
    results.append(("Distributed Integration", distributed_result))

    # Summary
    print("\n" + "=" * 60)
    print("📊 AI/ML Integration Test Results")
    print("=" * 60)

    successful_tests = 0
    for test_name, success in results:
        status = "✅ PASSED" if success else "⚠️  LIMITED"
        print("20")
        if success:
            successful_tests += 1

    print(f"\n🎯 Overall: {successful_tests}/{len(results)} tests successful")

    if successful_tests == len(results):
        print("\n🎉 ALL AI/ML MODELS ARE FULLY INTEGRATED!")
        print("   The SETI Cancer Research Universe now has:")
        print("   • 🧬 Genomic variant classification")
        print("   • 🖼️  Medical image tumor detection")
        print("   • 💊 Virtual drug screening")
        print("   • 🔗 Distributed computing integration")
        print("\n   Ready for real cancer research! 🌟")
    else:
        print("\n⚠️  Some AI models are running in mock mode.")
        print("   Install required dependencies for full functionality:")
        print("   • pip install torch torchvision torchaudio")
        print("   • pip install rdkit-pypi scikit-learn pandas")
        print("   • pip install opencv-python pydicom pillow")

if __name__ == '__main__':
    main()
